"""Catálogo demonstrativo fictício: idempotente, sem avaliações prévias."""
from sqlalchemy import select

from app.database import SessionLocal
from app.models import Movie

DEMO = [
    ("Interestelar", "Ficção científica", 2014, 169, "Uma missão espacial busca alternativas para o futuro da humanidade."),
    ("A Origem", "Ficção científica", 2010, 148, "Um especialista invade sonhos para plantar uma ideia impossível."),
    ("Duna", "Ficção científica", 2021, 155, "O herdeiro de uma família enfrenta disputas por um planeta desértico."),
    ("Blade Runner 2049", "Ficção científica", 2017, 164, "Um investigador descobre uma pista que pode mudar sua sociedade."),
    ("Ex Machina", "Ficção científica", 2014, 108, "Um programador participa de um experimento sobre consciência artificial."),
    ("Invocação do Mal", "Terror", 2013, 112, "Investigadores do paranormal atendem uma família assombrada."),
    ("A Freira", "Terror", 2018, 96, "Um mosteiro abriga uma presença sombria e misteriosa."),
    ("Corra!", "Terror", 2017, 104, "Uma visita familiar se transforma em um pesadelo perturbador."),
    ("Hereditário", "Terror", 2018, 127, "Uma família enfrenta acontecimentos inquietantes após uma perda."),
    ("O Iluminado", "Terror", 1980, 146, "O isolamento de um hotel afeta profundamente seus hóspedes."),
    ("Ilha do Medo", "Suspense", 2010, 138, "Dois agentes investigam o desaparecimento em uma instituição isolada."),
    ("Garota Exemplar", "Suspense", 2014, 149, "Um sumiço inesperado expõe segredos e desconfianças."),
    ("Os Suspeitos", "Suspense", 2013, 153, "O desaparecimento de duas crianças abala uma comunidade."),
    ("Clube da Luta", "Drama", 1999, 139, "Dois homens criam um clube que questiona as convenções sociais."),
    ("Oppenheimer", "Drama", 2023, 180, "Um cientista participa de decisões que marcam a história."),
    ("À Procura da Felicidade", "Drama", 2006, 117, "Um pai busca uma oportunidade de reconstruir a própria vida."),
    ("Mad Max: Estrada da Fúria", "Ação", 2015, 120, "Uma fuga pelo deserto desencadeia perseguições intensas."),
    ("John Wick", "Ação", 2014, 101, "Um ex-assassino volta ao submundo que tentou abandonar."),
    ("Top Gun: Maverick", "Ação", 2022, 130, "Um piloto veterano treina uma nova equipe para uma missão arriscada."),
    ("Divertida Mente", "Animação", 2015, 95, "As emoções de uma garota enfrentam mudanças inesperadas."),
    ("Homem-Aranha no Aranhaverso", "Animação", 2018, 117, "Um jovem descobre versões inesperadas do herói que admira."),
    ("Shrek", "Animação", 2001, 90, "Um ogro embarca em uma jornada que transforma suas amizades."),
    ("As Branquelas", "Comédia", 2004, 109, "Dois agentes se disfarçam para investigar uma ameaça."),
    ("Gente Grande", "Comédia", 2010, 102, "Amigos de infância se reencontram com suas famílias."),
]


def main():
    added = 0
    with SessionLocal() as db:
        existing = {title.casefold() for title in db.scalars(select(Movie.title)).all()}
        for title, genre, year, duration_min, synopsis in DEMO:
            if title.casefold() not in existing:
                db.add(Movie(title=title, genre=genre, year=year, duration_min=duration_min, synopsis=synopsis))
                added += 1
        db.commit()
    print(f"Catálogo demonstrativo: {added} filme(s) adicionados.")


if __name__ == "__main__":
    main()
