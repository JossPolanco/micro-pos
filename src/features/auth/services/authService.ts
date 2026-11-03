const API_BASE_URL = "http://127.0.0.1:5123/api";

// SEND LOGOUT REQUEST TO THE BACKEND SIDECAR TO INVALIDATE THE CURRENT SESSION
export async function logoutUser(token: string): Promise<void> {
	try {
		await fetch(`${API_BASE_URL}/auth/logout`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
	} catch {
		// IGNORE NETWORK ERRORS IF BACKEND SIDECAR IS NOT RUNNING YET
	}
}

