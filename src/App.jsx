import { services, slides } from "./siteData.js";

export default function App() {
  return (
    <>
      <header className="topbar">
        <strong className="logo">JFC</strong>
        <nav><a href="#services">Services</a><a href="#realisations">Realisations</a><a href="#contact">Contact</a></nav>
      </header>
      <main>
        <section className="hero">
          <div>
            <p className="tag">Renovation interieure</p>
            <h1>JFC Renovation Interieure</h1>
            <p>Cuisine, salle de bain, parquet, placo et travaux d'amenagement interieur.</p>
            <a href="#contact">Demander un devis</a>
          </div>
          <div className="slider">{slides.map((item) => <article key={item}><b>JFC</b><span>{item}</span></article>)}</div>
        </section>
        <section id="services"><h2>Services</h2><div className="grid">{services.map((item) => <article key={item}><h3>{item}</h3><p>Travail soigne, propre et adapte au projet.</p></article>)}</div></section>
        <section id="realisations"><h2>Realisations recentes</h2><p>Galerie compacte avec photos qui tournent pour eviter une page trop chargee.</p></section>
        <section id="contact"><h2>Contact</h2><p>Telephone : 06 07 72 16 33</p><p>Email : jonatanfc97@gmail.com</p><p>SIRET : 93484902700016</p></section>
      </main>
    </>
  );
}
