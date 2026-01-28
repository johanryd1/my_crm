DEPLOY SETUP
------------

* Databas: Supabase (Permanent gratis Postgres)
(https://supabase.com/dashboard/org/aqrmdcfkftxqqeuehvaw)


* Kod (Backend/Django): Render.com (Gratis plan)
(https://dashboard.render.com/project/prj-d5nlfckoud1c73a1spb0)


* Frontend: Vercel (Permanent gratis React-hosting)


1. Automatiska Deploys (CI/CD)
Både Render och Vercel lyssnar på ditt GitHub-repo. Så fort de ser en ny "commit" i din huvudgren (main):

- Vercel: Ser att du ändrat i frontenden, bygger om din React-app och publicerar den nya versionen. Det tar oftast 30–60 sekunder.
- Render: Ser att koden ändrats, installerar om dina requirements.txt och startar om din Django-server med den nya koden.

2. Så här gör du vid databasändringar

- Lokalt: Kör python manage.py makemigrations och python manage.py migrate. Kontrollera att det funkar på din Chromebook.
- Pusha: git push origin main.

Uppdatera Molnet: När Render är klar med sin deploy måste du köra migrationerna även där:

- Gå till din tjänst på Render.
- Klicka på Shell i menyn till vänster.
- Skriv: python manage.py migrate och tryck Enter.

3. "The Golden Rule" för smidiga uppdateringar
För att undvika att din live-sida ligger nere medan du jobbar, följ alltid denna ordning:

- Utveckla och testa allt lokalt på din Chromebook (med din lokala Postgres).
- Pusha till GitHub när du är nöjd.
- Migrera databasen på Render direkt efteråt om du gjort ändringar i models.py.


Titta i min lokala Postgres-databas
1. I terminalen kör, "python manage.py dbshell"
2. Kör query, typ "SELECT id, note, account_id, deal_id FROM core_activity ORDER BY id DESC LIMIT 10;"