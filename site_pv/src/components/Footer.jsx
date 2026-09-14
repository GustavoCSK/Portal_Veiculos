import React from 'react'

function Footer() {
    return (
        <div className="footer">
            <div className="address">
                <p>Rua Cateano Costa N-1151, Centro - Canoinhas-SC</p>
            </div>
            <div className="contact">
                <p>Contato:
                    <ul>
                        <li>(47) 99986-4050</li>
                        <li>(47) 3624-1112</li>
                    </ul>
                </p>
            </div>
            <div className="login">
                <p><a href="/login">Login</a></p>
            </div>
        </div>
    )
}

export default Footer