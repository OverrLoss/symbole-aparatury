# Symbole aparatury — aplikacja do nauki

Nauka symboli aparatury chemicznej wg załączonej karty (7 grup, 49 symboli).
Statyczna aplikacja bez zależności i bez kroku budowy.

## Tryby

- **Rysuj i sprawdź** — odręczne rysowanie symbolu na canvasie; ocena porównuje
  znormalizowany kształt (nie zależy od rozmiaru ani położenia) i pokazuje wzór.
- **Dopasuj nazwę** — wybór jednej z czterech nazw dla pokazanego symbolu.
- **Pisz z pamięci** — wpisanie nazwy; ignorowana wielkość liter i diakrytyki,
  akceptowane są też warianty w nawiasach.

Filtry: kategoria I–VII, kolejność losowa, licznik trafień.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce albo:

```bash
python -m http.server 8080
```

i wejdź na `http://localhost:8080`.

## Deploy na Netlify

1. Wrzuć repozytorium na GitHub.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project → GitHub**.
3. Wybierz to repozytorium. Netlify wykryje `netlify.toml`: `publish = "."`, brak komendy budowy.
4. **Deploy site**. Adres `app.netlify.com` to panel — po wdrożeniu Netlify nada własny URL
   (np. `symbole-aparatury.netlify.app`). Własną domenę dodasz w **Domain settings**.

Pliki: `index.html`, `styles.css`, `symbols.js` (dane symboli jako ścieżki Path2D), `app.js` (logika i ocena rysunku).
