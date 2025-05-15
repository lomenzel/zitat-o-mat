# Zitat-O-Mat

Quizze dich durch die Wahlprogramme!

## So funktioniert's

1. Du siehst ein kurzes Zitat aus einem Wahlprogramm und vier Parteien, von denen das Zitat stammen könnte.
2. Aus den Antwortmöglichkeiten wählst du die Partei aus, von der du vermutest, dass das Zitat aus ihrem Wahlprogramm stammt.
3. Repeat (so lange der Zitatvorrat reicht!)

## Entwicklung

### 1. Repository klonen
```bash
git clone https://github.com/lomenzel/zitat-o-mat.git
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Quelldatei der Zitate generieren
Die Zitate sind in `txt`-Dateien gespeichert. Um diese für das Frontend zu verwenden, müssen sie in ein JSON-Format umgewandelt werden. Dies geschieht mit Nix. Falls du Nix noch nicht installiert hast, kannst du das [hier](https://nixos.org/download/) nachholen.
```bash
nix build .\#dataDir
```
Das Ergebnis des Builds ist in `./result` zu finden.

### 4. App starten
Um die App zu starten:
```bash
npm run dev
```

## Hä, wieso geht das bei mir nicht?

Node.js und VS Code mit Vue-Erweiterung werden durch ein Nix Flake bereitgestellt, um sicherzustellen, dass alle die selben Versionen verwenden. 

### Linux, Windows, Mac

[Nix](https://nixos.org/download/) Paketmanager installieren

### Android

[Nix-On-Droid](https://github.com/nix-community/nix-on-droid) installieren

### Für alle

> Die experimentellen Features `flakes` und `pipe-operators` müssen aktiviert sein.

Um eine Shell zu öffnen, in der alle für dieses Projekt notwendigen Abhängigkeiten installiert sind:
```bash
nix develop
```

Um eine VS Code Instanz zu öffnen, in der alle benötigten Extensions und Abhängigkeiten enthalten sind:
```bash
nix develop -c codium .
```

Um einen fertigen Ordner zu erstellen, der so für eine Produktivversion verwendet werden kann:
```bash
nix build
```

Wenn man nur die JSON-Dateien mit den Zitaten möchte:
```bash
nix build .\#dataDir
```

Das Ergebnis des Builds ist in `./result`.

> **Pro-Tipp**: `nix build` funktioniert auch, wenn man das Repository nicht geklont hat :) Wer also nur den Build braucht und auf der Maschine nicht entwickeln möchte, kann einfach `nix build github:lomenzel/zitat-o-mat` ausführen!