# EIB GROUP — საიტი

ქართულ და ინგლისურენოვანი საიტი: `index.html` (ქართული) და `en/index.html` (English).
საიტი ქვეყნდება GitHub Pages-ზე ყოველი `main`-ში ცვლილების შემდეგ (`.github/workflows/pages.yml`).

## ადმინ პანელი

მისამართი: საიტის მისამართს მიუწერეთ `/admin/`, მაგ. `https://bekatab.github.io/first-repo/admin/`.
საიტიდან პანელზე ბმული არ არის და Google-ში არ ინდექსირდება.

**პირველი დაყენება (თითო მოწყობილობაზე ერთხელ):**

1. GitHub-ზე შექმენით Fine-grained token: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - Repository access: *Only select repositories* → `first-repo`
   - Permissions: **Contents — Read and write**, **Actions — Read-only**
2. გახსენით `/admin/`, ჩასვით token და შექმენით პაროლი (მინიმუმ 8 სიმბოლო).
   Token დაშიფრულად ინახება მხოლოდ ამ ბრაუზერში; შემდეგ ჯერზე საკმარისია პაროლი.

**რისი შეცვლა შეიძლება:**
- ყველა ტექსტი ორივე ენაზე, ტელეფონი, ელ-ფოსტა, მისამართი, ციფრები, Google-ის სათაური/აღწერა;
- ლოგო (ატვირთვა/წაშლა, ცალკე ვერსია მუქი ფონისთვის, „EIB GROUP“ წარწერის დამალვა);
- **ფერები** — მთავარი მუქი, აქცენტი, ოქროსფერი და ორი ღია ფონი (წაკითხვადობის გაფრთხილებით);
- **გვერდის სტრუქტურა** — ვიდეოს, სერვისების და ციფრების სექციების დამალვა/ჩვენება (მენიუც შესაბამისად იცვლება);
  ახალი ბლოკების დამატება, რიგის შეცვლა და წაშლა (სათაური, ტექსტი ორივე ენაზე, სურათი, ფონი, ადგილი გვერდზე);
- ფორმის მიმღები მისამართი.
ცვლილებები ჩანს გადახედვაში ჯერ კიდევ გამოქვეყნებამდე; „გამოქვეყნება“ ინახავს ყველაფერს ერთ commit-ად
და საიტი განახლდება დაახლოებით 1 წუთში.

**ფორმა:** შეტყობინებების მისაღებად შექმენით უფასო ფორმა [formspree.io](https://formspree.io)-ზე და
ადმინში („კონტაქტი და ლოგო“) ჩასვით მისი მისამართი. მანამდე საიტი ვიზიტორს სთხოვს დარეკვას.

## როგორ მუშაობს

- `content.json` — ადმინში რედაქტირებადი შინაარსი (ტექსტები `ka`/`en`, საერთო პარამეტრები `shared`).
- HTML-ში რედაქტირებად ელემენტებს აქვთ `data-edit="გასაღები"`.
- `tools/apply-content.mjs` — გამოქვეყნებისას `content.json` ჩაწერს HTML-ში (ვიზიტორი და Google ხედავს საბოლოო ტექსტს).
- `tools/render-blocks.js` — დამატებითი ბლოკების ერთი შაბლონი (გამოიყენება გამოქვეყნებისას და ადმინის გადახედვაში).
- ატვირთული ლოგოები და სურათები ინახება `media/uploads/`-ში.

---

**Admin panel (English):** open `/admin/` on the site. First use on a device: create a fine-grained GitHub token
for this repository with *Contents: Read and write* and *Actions: Read-only*, paste it, and choose a password; the
token is stored encrypted in that browser only. Edits are saved to `content.json` (plus uploaded logos) in one commit;
the Pages workflow applies them to the HTML with `tools/apply-content.mjs` and redeploys in about a minute.
