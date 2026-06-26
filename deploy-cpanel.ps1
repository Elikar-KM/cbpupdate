# Script de preparation pour le deploiement cPanel
# Executez ce script pour preparer les fichiers de production

Write-Host "Preparation du build pour cPanel..." -ForegroundColor Cyan

# Verifier si .env.production existe
if (-Not (Test-Path ".env.production")) {
    Write-Host "Fichier .env.production manquant!" -ForegroundColor Yellow
    Write-Host "Copiez .env.production.template vers .env.production et configurez-le" -ForegroundColor Yellow
    Copy-Item ".env.production.template" ".env.production"
    Write-Host "Fichier .env.production cree. Veuillez le configurer avant de continuer." -ForegroundColor Green
    exit
}

# Nettoyer les anciens builds
Write-Host "Nettoyage des anciens builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "cpanel-deploy") {
    Remove-Item -Recurse -Force "cpanel-deploy"
}

# Installer les dependances
Write-Host "Installation des dependances..." -ForegroundColor Yellow
pnpm install

# Generer Prisma
Write-Host "Generation de Prisma..." -ForegroundColor Yellow
pnpm prisma generate

# Build de production
Write-Host "Compilation du projet..." -ForegroundColor Yellow
pnpm build

# Verifier si le build a reussi
if (-Not (Test-Path ".next/standalone")) {
    Write-Host "Erreur: Le build standalone n'a pas ete cree!" -ForegroundColor Red
    Write-Host "Verifiez que next.config.ts contient: output: 'standalone'" -ForegroundColor Red
    exit 1
}

# Creer le dossier de deploiement
Write-Host "Creation du dossier de deploiement..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "cpanel-deploy" | Out-Null

# Copier les fichiers necessaires
Write-Host "Copie des fichiers..." -ForegroundColor Yellow

# Copier standalone
Copy-Item -Recurse ".next/standalone/*" "cpanel-deploy/"

# Creer le dossier .next dans cpanel-deploy s'il n'existe pas
New-Item -ItemType Directory -Force -Path "cpanel-deploy/.next" | Out-Null

# Copier static
Copy-Item -Recurse ".next/static" "cpanel-deploy/.next/"

# Copier public
Copy-Item -Recurse "public" "cpanel-deploy/"

# Copier les fichiers de configuration
Copy-Item "server.js" "cpanel-deploy/"
Copy-Item "package.json" "cpanel-deploy/"
Copy-Item ".env.production" "cpanel-deploy/"

# Copier le README
if (Test-Path "cpanel_readme.md") {
    Copy-Item "cpanel_readme.md" "cpanel-deploy/README.md"
} else {
    Write-Host "Note: cpanel_readme.md non trouve, ignore." -ForegroundColor DarkGray
}

# Creer une archive
Write-Host "Creation de l'archive..." -ForegroundColor Yellow
$dateStr = Get-Date -Format 'yyyyMMdd-HHmmss'
$archiveName = "cbp-production-$dateStr.zip"
Compress-Archive -Path "cpanel-deploy/*" -DestinationPath $archiveName -Force

Write-Host ""
Write-Host "Build termine avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Archive creee: $archiveName" -ForegroundColor Cyan
Write-Host "Fichiers de deploiement dans: cpanel-deploy/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. Uploadez $archiveName sur votre serveur cPanel" -ForegroundColor White
Write-Host "2. Extrayez l'archive dans le dossier de votre application" -ForegroundColor White
Write-Host "3. Configurez l'application Node.js dans cPanel" -ForegroundColor White
Write-Host "4. Suivez les instructions dans cpanel-deploy/README.md" -ForegroundColor White
Write-Host ""
