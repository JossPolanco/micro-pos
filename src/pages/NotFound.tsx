import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="relative text-center max-w-2xl">
            <div className="absolute inset-0 blur-3xl opacity-20">
                <div className="w-72 h-72 bg-primary rounded-full mx-auto" />
            </div>

            <div className="relative">
                <h1 className="text-[8rem] md:text-[10rem] font-black text-primary leading-none">
                    404
                </h1>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t("not_found.title")}
                </h2>

                <p className="text-lg text-base-content/70 mb-8">                    
                    {t("not_found.desc")}
                </p>

                <div className="flex justify-center gap-4 flex-wrap">
                    <Link to="/home" className="btn btn-primary">
                        {t("not_found.back_home")}
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="btn btn-ghost"
                    >
                        {t("not_found.return")}
                    </button>
                </div>
            </div>
        </div>
    );
}