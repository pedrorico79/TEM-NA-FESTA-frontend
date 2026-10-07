import "../css/LoadingState.css";

function LoadingState({ label = "Carregando…", className = "" }) {
    return (
        <div className={`loading-state ${className}`.trim()} role="status" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true" />
            <span className="loading-label">{label}</span>
        </div>
    );
}

export default LoadingState;
