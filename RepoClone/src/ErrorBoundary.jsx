import React from "react";

/**
 * Catches render-time errors anywhere in the tree and shows a visible
 * message instead of a blank white page.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        // Surface the error in the console for debugging.
        console.error("App crashed:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0a0a0a",
                        color: "#d4af37",
                        fontFamily: "Courier New, monospace",
                        padding: "2rem",
                    }}
                >
                    <div style={{ maxWidth: 640, textAlign: "center" }}>
                        <h1 style={{ letterSpacing: "0.2rem", marginBottom: "1rem" }}>
                            SYSTEM FAULT
                        </h1>
                        <p style={{ color: "#9aa888", marginBottom: "1rem" }}>
                            Something crashed while rendering. Details below (also in the
                            browser console).
                        </p>
                        <pre
                            style={{
                                textAlign: "left",
                                whiteSpace: "pre-wrap",
                                background: "#15150f",
                                border: "1px solid #3a3a2a",
                                padding: "1rem",
                                color: "#ff6b6b",
                                fontSize: "0.8rem",
                                overflow: "auto",
                            }}
                        >
                            {String(this.state.error?.stack || this.state.error)}
                        </pre>
                        <a href="/" style={{ color: "#5ad65a" }}>
                            ← Back to home
                        </a>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
