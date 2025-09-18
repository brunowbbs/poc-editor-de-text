import { Link } from "react-router";

function App() {
  return (
    <div>
      <h1>Escolha uma opção</h1>
      <ul>
        <Link to="/lexical">
          <li>Lexical</li>
        </Link>
        <Link to="/editorjs">
          <li>Editor JS</li>
        </Link>
        <Link to="/quilljs">
          <li>Quill JS</li>
        </Link>
      </ul>
    </div>
  );
}

export default App;
