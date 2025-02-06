# BTW-Quizz

Quizz dich durch die Wahlprogramme!

## So Funktioniert's

du siehst ein Ausschnitt aus einem Wahlprogramm, dann wälst du eine Partei aus 4 Optionen aus von der du vermutest dass das zietat aus ihrem Wahlprogramm stammt.

## Entwicklung

Das Projekt nutzt Plain Javascript und HTML. der src ordner kann also einfach mit `npx serve ./src` bereitgestellt werden. Die Wahlprogramme werden dann aus der `data.json` geladen. Dabei handelt es sich um test daten in denen beliebig edge cases getestet werden können.

nodejs (und potentiell weitere tools (ich hab gehört es gibt vuejs fans unter uns)) werden durch ein nix flake bereitgestellt um sicher zu stellen dass alle die selben Versionen verwenden. 

### Linux 

NixOS: Nichts weiter Notwendig

[Nix](https://nixos.org/download/) Paketmanager Installieren

### Windows

[Nix](https://nixos.org/download/#nix-install-windows) Paketmanager installieren

### MacOS 

[Nix](https://nixos.org/download/#nix-install-macos) Paketmanager installieren. (Ein Docker Container mit nix sollte auch reichen)

### Android

[Nix-On-Droid](https://github.com/nix-community/nix-on-droid) installieren

### Für Alle

> Flakes sollten aktiviert sein

um eine Shell zu öffnen in der alle für dieses Projekt notwendigen Abhängigkeiten installiert sind (bisher nur nodejs für npx) aber das könnten ja noch mehr werden:

```bash
$ nix develop
```

um ein Fertigen Ordner zu erstellen der so Für eine Produktiv version verwendet werden kann:

```bash
nix build .\#btw-quizz
```

wenn man nur die data.json mit echten daten möchte

```bash
nix build .\#data
```

das ergebnis des builds ist in `./result`

> Pro Tipp: nix build funktioniert auch wenn man das repo nicht geklont hat :) wer also nur den build braucht und auf der maschine nicht entwikeln möchte kann einfach `nix build github:lomenzel/btw-quizz/main\#btw-quizz` ausführen