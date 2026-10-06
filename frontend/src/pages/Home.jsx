import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cards from '../components/Cards'

function Home({ onSelectVehicle }) {
    return (
        <div className="homePage">
            <Header />
            <main>
                <section className="hero" aria-labelledby="hero-title">
                    <div className="heroContent">
                        <p className="eyebrow">Há mais de 25 anos em Canoinhas</p>
                        <h1 id="hero-title">Seu próximo carro está mais perto.</h1>
                        <p className="heroDescription">Uma história feita de confiança, bons negócios e caminhos novos. Encontre aqui o veículo certo para você.</p>
                        <a className="heroAction" href="#estoque">
                            Ver veículos <span aria-hidden="true">↘</span>
                        </a>
                    </div>
                    <div className="heroStamp">
                        <strong>Compra · Venda · Financiamento</strong>
                        <span>Atendimento próximo, negócio transparente.</span>
                    </div>
                </section>
                <section className="inventory" id="estoque" aria-labelledby="inventory-title">
                    <div className="sectionHeading">
                        <div>
                            <p className="eyebrow">Seleção Portal</p>
                            <h2 id="inventory-title">Veículos em destaque</h2>
                        </div>
                        <p>Boas escolhas para seguir em frente.</p>
                    </div>
                    <div className="vehicleGrid">
                        <Cards onSelectVehicle={onSelectVehicle} />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default Home