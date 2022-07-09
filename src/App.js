import React from 'react';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';
import './App.css';
import { store } from './database.js';
import Home from './views/home.js';
import Address from './views/address.js';
import Token from './views/token.js';
import Editor from './views/editor.js';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/token/:tokenId" element={<Token />} />
                    <Route path="/address/:address" element={<Address />} />
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;
