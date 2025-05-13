{
  description = "Packages and dev Shell for the zitat-o-mat-org Website";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    , ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      with builtins;
      let
        pkgs = import nixpkgs { inherit system; };
        package-json = fromJSON (readFile ./package.json);
        lib = pkgs.lib;
        parties = readFile ./resources/parties.json |> fromJSON;
        parseProgramFile = path: 
          let
            repeat = element: n: if n <= 0 then [] else [element] ++ (repeat element (n - 1));
            withArticles = name: [
              "Die ${name}"
              "die ${name}"
              "Das ${name}"
              "das ${name}"
              name
            ];
            content = readFile path;
            lines = lib.splitString "\n" content;
            source = lines
              |> head
              |> lib.splitString " "
              |> (e: elemAt e 1)
              ;
            phrases = tail lines
              |> map (l: lib.trim l)
              |> filter (l: l != "" && ! lib.hasPrefix "# " l)

              # Filter Party Names
              |> map (replaceStrings (withArticles parties.${party}.short_name) (repeat "[Parteiname]" 5))
              |> map (replaceStrings (withArticles parties.${party}.full_name) (repeat "[Parteiname]" 5))
              |> map (replaceStrings (withArticles (lib.toUpper parties.${party}.full_name)) (repeat "[Parteiname]" 5))
              |> map (replaceStrings (withArticles (lib.toUpper parties.${party}.short_name)) (repeat "[Parteiname]" 5))
              |> (p: if hasAttr "alias" parties.${party} then foldl' (acc: curr:
                map (replaceStrings (withArticles curr) (repeat "[Parteiname]" 5)) acc
              ) p parties.${party}.alias else p)

              # Satzzeichen
              |> map (lib.removeSuffix ".")
              |> map (e: if lib.hasSuffix "!" e then e else e + ".")
              ;
            
            fileName = (lib.path.splitRoot path).subpath 
              |> lib.path.subpath.components
              |> lib.last
              ;

            election = fileName
              |> lib.splitString "."
              |> head
              ;

            type = if election == "mission_statement" || election == "party_platform" then 
              election else "election";

            metadata = if type == "election" then
              {inherit election type;} else
              {inherit type;};

            party = (lib.path.splitRoot path).subpath 
              |> lib.path.subpath.components
              |> lib.init
              |> lib.last
              ;
          in
            if lib.hasPrefix "none" content then 
              {party = parties.${party};} // metadata else 
            if lib.hasPrefix "todo" content then
              lib.warn "${parties.${party}.full_name} hat vielleicht ein Wahlprogramm für die Wahl ${election}." ({party = parties.${party};} // metadata) 
            else if ! lib.hasPrefix "# https://" content then throw "das Wahlprogramm von ${parties.${party}.full_name} für die Wahl ${election} hat keine quelle" else
              {party = parties.${party};} // { inherit phrases source; } // metadata;

          data = lib.filesystem.listFilesRecursive ./resources/programs
            |> map parseProgramFile
            ;

          mission_statements = filter (e: e.type == "mission_statement") data;
          party_platforms = filter (e: e.type == "party_platform") data;

          byElection = election: data
            |> filter (e: e.type == "election")
            |> filter (e: e.election == election)
            |> map (e:
              let 
                fallback = [
                  (lib.findFirst (party_platform: e.party.full_name == party_platform.party.full_name) [] party_platforms)
                  (lib.findFirst (mission_statement: e.party.full_name == mission_statement.party.full_name) [] mission_statements)
                ];
              in
              if hasAttr "phrases" e then [e] else
              if lib.flatten fallback == [] then
                lib.warn "${e.party.full_name} tritt zur wahl ${election} an, es wurden aber keine programme gefunden" [] else
              fallback
            )
            |> lib.flatten
            |> filter (e: e != null)
            |> toJSON
            |> pkgs.writeText "${election}.json"
            ;

          

          elections = data
            |> filter (e: e.type == "election")
            |> map (e: e.election)
            |> lib.lists.unique
            ;

      in
      {
        packages = rec {
          default = web;
          srcWithData = pkgs.stdenv.mkDerivation {
            pname = "src";
            inherit (package-json) version;
            src = ./.; 
            installPhase = ''
              mkdir -p $out/public
              cp -r $src/* $out
              cp -fr ${dataDir}/* $out/public/
            '';
          };

          web = pkgs.buildNpmPackage rec {
            pname = package-json.name;
            inherit (package-json) version;
            src = srcWithData;
            npmDepsHash = "sha256-0m5XX+V3uaybHAWHwGm23LJiEFC4ArypuKJaeRp7y78=";
            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out
            '';
          };
        dataDir = pkgs.stdenv.mkDerivation
            {
              pname = "data-directory";
              inherit (package-json) version;
              src = ./.;
              installPhase =
                let
                  toElectionCopyString = election:
                    "cp ${byElection election} $out/election/${election}.json";
                in ''
                  mkdir -p $out/election
                  ${map toElectionCopyString elections |> foldl' (acc: curr: acc + "\n" + curr) ""}
                  cp ${elections |> toJSON |> pkgs.writeText "elections.json"} $out/elections.json
                '';
            };
        };

        devShell = pkgs.mkShell
          {
            nativeBuildInputs = with pkgs; [
              nodejs
              (vscode-with-extensions.override {
                vscodeExtensions = with pkgs.vscode-extensions; [
                  jnoortheen.nix-ide
                  vue.volar
                ];
                vscode = vscodium;
              })

            ];
          };
      }
    );
}
