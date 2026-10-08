import { useId } from "react";

const ManaraLogo = ({ className = "", introTarget = false }) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

    return (
        <svg
            viewBox="0 0 120 120"
            role="img"
            aria-label="منارة"
            className={className}
        >
            <defs>
                <linearGradient
                    id={`manara-mark-${uid}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop offset="0" stopColor="#F97316" />   {/* برتقالي فاتح */}
                    <stop offset="0.5" stopColor="#EA580C" /> {/* برتقالي أساسي */}
                    <stop offset="1" stopColor="#C2410C" />   {/* برتقالي غامق */}
                </linearGradient>
            </defs>

            {/* مسار شعار منارة */}
            <path
                d="M60 10C32.4 10 10 32.4 10 60s22.4 50 50 50 50-22.4 50-50S87.6 10 60 10zm0 85c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35zm-5-50h10v30H55z"
                fill={`url(#manara-mark-${uid})`}
                fillRule="evenodd"
                {...(introTarget ? { "data-intro-mark": "" } : {})}
            />
        </svg>
    );
};
export default ManaraLogo;