import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Home() {
    return (
        <div>
            <Header />
            <div className="home">
                <div className="hero">
                    <div className="heroDesc">
                        <p>Com mais de 25 anos de historia no ramo, a Portal Veiculos foi a segunda loja de automoveis da cidade</p>
                        <p>Nossa equipe sempre pronta para te atender e fazer a melhor poposta para sua satisfacao</p>
                        <p>Compra, Vende, Financia</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Home