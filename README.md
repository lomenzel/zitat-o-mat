# Zitat-o-Mat

Quizz dich durch die Wahlprogramme!

## So Funktioniert's

du siehst ein Ausschnitt aus einem Wahlprogramm, dann wälst du eine Partei aus 4 Optionen aus von der du vermutest dass das zietat aus ihrem Wahlprogramm stammt.

## Entwicklung

Das Projekt nutzt VueJS. 

nodejs und VS-Code+Vue-Erweiterung werden durch ein nix flake bereitgestellt um sicher zu stellen dass alle die selben Versionen verwenden. 

### Linux, Windows, Mac

[Nix](https://nixos.org/download/) Paketmanager Installieren

### Android

[Nix-On-Droid](https://github.com/nix-community/nix-on-droid) installieren

### Für Alle

> Die Experimentellen Features `flakes` und `pipe-operators` müssen aktiviert sein

um eine Shell zu öffnen in der alle für dieses Projekt notwendigen Abhängigkeiten installiert sind:

```bash
nix develop
```

um eine VsCode instanz zu öffnen in der alle Benötigten extensions und abhängigkeiten drin sind
```bash
nix develop -c codium .
```

um ein Fertigen Ordner zu erstellen der so Für eine Produktiv version verwendet werden kann:

```bash
nix build
```

wenn man nur die JSON dateien mit den Zitaten möchte

```bash
nix build .\#dataDir
```

das ergebnis des builds ist in `./result`

> Pro Tipp: nix build funktioniert auch wenn man das repo nicht geklont hat :) wer also nur den build braucht und auf der maschine nicht entwikeln möchte kann einfach `nix build github:lomenzel/zitat-o-mat` ausführen