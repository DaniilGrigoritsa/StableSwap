import { Link } from "react-router-dom";

export function Contacts() {
    return (
        <div className="contacts">
            <h1>Contacts</h1>
            <Link className="link" to="/">Back</Link>
        </div>
    )
}