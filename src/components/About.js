import { Link } from "react-router-dom";

export function About() {
    return (
        <div className="about">
            <h1>About</h1>
            <Link className="link" to="/">Back</Link>
        </div>
    )
}