
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Player from './pages/Player';
import Memory from './pages/Memory';
import Stories from './pages/Stories'; // 新增引入 D 模块的作品库页面

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="stories" element={<Stories />} /> {/* 注册路由 */}
          <Route path="editor" element={<Editor />} />
          <Route path="player" element={<Player />} />
          <Route path="memory" element={<Memory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
