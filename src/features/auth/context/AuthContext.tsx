import {
	createContext,
	useState,
	useEffect,
	useCallback,
	useRef,
	ReactNode,
	useContext,
} from "react";
import { jwtDecode } from "jwt-decode";
import { logoutUser } from "../services/authService";

// COMPANY AND GENERAL POS SETTINGS EXTRACTED FROM JWT
export interface AuthCompany {
	commercialName?: string;
	logoUrl?: string;
	iconName?: string;
	mainCurrency: string;
}

// BACKWARD COMPATIBILITY FOR COMPONENTS LIKE DYNAMICCURRENCY AND TABLE
export interface AuthTenant {
	currency: string;
}

// LOGGED IN POS USER PROPERTIES EXTRACTED FROM JWT
export interface AuthUser {
	id: string;
	nickname: string;
	role: string;
}

// STRICT TYPE FOR DECODED JWT PAYLOAD TO AVOID USING ANY
interface PosJwtPayload {
	sub?: string;
	userId?: string;
	nickname?: string;
	role?: string;
	companyCommercialName?: string;
	companyLogoUrl?: string;
	companyIconName?: string;
	companyMainCurrency?: string;
	exp?: number;
	iat?: number;
}

// AUTHENTICATION CONTEXT PROPERTIES
export interface AuthContextType {
	isAuthenticated: boolean;
	loading: boolean;
	user: AuthUser | null;
	company: AuthCompany;
	tenant: AuthTenant;
	login: (token: string) => boolean;
	logout: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = "jwt_token";

const DEFAULT_COMPANY: AuthCompany = {
	commercialName: "Micro-POS",
	mainCurrency: "MXN",
};

// CREATE AUTH CONTEXT
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CUSTOM HOOK TO USE AUTH CONTEXT ACROSS THE APP
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside an AuthProvider");
	}
	return context;
};

// CHECK IF TOKEN IS EXPIRED WITH A 5 SECOND SAFETY BUFFER
function isTokenExpired(exp?: number): boolean {
	if (!exp) return true;
	const nowInSeconds = Math.floor(Date.now() / 1000);
	return exp <= nowInSeconds + 5;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<AuthUser | null>(null);
	const [company, setCompany] = useState<AuthCompany>(DEFAULT_COMPANY);
	const [loading, setLoading] = useState(true);

	const expirationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// CLEAR ANY ACTIVE AUTO-LOGOUT TIMER
	const clearExpirationTimer = useCallback(() => {
		if (expirationTimerRef.current) {
			clearTimeout(expirationTimerRef.current);
			expirationTimerRef.current = null;
		}
	}, []);

	// CLEAN LOCAL STATE AND STORAGE SAFELY
	const clearSessionState = useCallback(() => {
		clearExpirationTimer();
		sessionStorage.removeItem(TOKEN_STORAGE_KEY);
		setIsAuthenticated(false);
		setUser(null);
		setCompany(DEFAULT_COMPANY);
	}, [clearExpirationTimer]);

	// LOGOUT FUNCTION WITH TRY/FINALLY SO LOCAL SESSION ALWAYS CLEARS EVEN IF BACKEND FAILS
	const logout = useCallback(async () => {
		const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
		clearSessionState();

		if (token) {
			await logoutUser(token);
		}
	}, [clearSessionState]);

	// VALIDATE JWT, EXTRACT CLAIMS AND SCHEDULE AUTOMATIC EXPIRATION LOGOUT
	const authenticateFromToken = useCallback(
		(token: string): boolean => {
			try {
				const decoded = jwtDecode<PosJwtPayload>(token);
				const userId = decoded.userId || decoded.sub;

				// REJECT TOKEN IF REQUIRED CLAIMS ARE MISSING OR TOKEN IS ALREADY EXPIRED
				if (
					!userId ||
					!decoded.nickname ||
					!decoded.role ||
					isTokenExpired(decoded.exp)
				) {
					clearSessionState();
					return false;
				}

				setUser({
					id: String(userId),
					nickname: String(decoded.nickname),
					role: String(decoded.role),
				});

				setCompany({
					commercialName: decoded.companyCommercialName || "Micro-POS",
					logoUrl: decoded.companyLogoUrl || undefined,
					iconName: decoded.companyIconName || undefined,
					mainCurrency: decoded.companyMainCurrency || "MXN",
				});

				setIsAuthenticated(true);
				sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

				// SCHEDULE AUTOMATIC LOGOUT WHEN THE JWT EXPIRES
				clearExpirationTimer();
				if (decoded.exp) {
					const msUntilExpiry = decoded.exp * 1000 - Date.now();
					if (msUntilExpiry > 0) {
						expirationTimerRef.current = setTimeout(() => {
							void logout();
						}, msUntilExpiry);
					}
				}

				return true;
			} catch (error) {
				console.error("Invalid JWT token", error);
				clearSessionState();
				return false;
			}
		},
		[clearExpirationTimer, clearSessionState, logout],
	);

	// RESTORE SESSION ON APP STARTUP IF A VALID TOKEN EXISTS IN SESSIONSTORAGE
	useEffect(() => {
		const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
		if (token) {
			authenticateFromToken(token);
		}
		setLoading(false);

		return () => {
			clearExpirationTimer();
		};
	}, [authenticateFromToken, clearExpirationTimer]);

	const login = useCallback(
		(token: string): boolean => authenticateFromToken(token),
		[authenticateFromToken],
	);

	// ALIAS OBJECT KEPT FOR BACKWARD COMPATIBILITY WITH UI COMPONENTS
	const tenant: AuthTenant = {
		currency: company.mainCurrency,
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				loading,
				user,
				company,
				tenant,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
