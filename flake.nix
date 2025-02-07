{
  description = "Packages and dev Shell for the btw-quizz Website";

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
              |> map (replaceStrings (withArticles party) (repeat "[Parteiname]" 5))
              |> map (replaceStrings (withArticles parties.${party}.full-name) (repeat "[Parteiname]" 5))
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
            {party = parties.${party};} // { inherit phrases source; } // metadata;

          data = lib.filesystem.listFilesRecursive ./resources/programs
            |> map parseProgramFile
            ;

          mission_statements = data
            |> filter (e: e.type == "mission_statement")
            |> toJSON
            |> pkgs.writeText "mission_statements.json"
            ;

          party_platforms = data
            |> filter (e: e.type == "party_platform")
            |> toJSON
            |> pkgs.writeText "party_platforms.json"
            ;

          byElection = election: data
            |> filter (e: e.type == "election")
            |> filter (e: e.election == election)
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
        packages =
            let
              version = "0.0.1-vue-beta";
            in
           rec {
          default = btw-quizz;
          
          srcWithData = pkgs.stdenv.mkDerivation {
            pname = "quizz-src";
            inherit version;
            src = ./.; 
            installPhase = ''
              mkdir -p $out/public
              cp -r $src/* $out
              cp ${data} $out/public/data.json
            '';
          };
          btw-quizz = pkgs.buildNpmPackage rec {
            pname = "btw-quizz";
            inherit version;
            src = srcWithData;
            npmDepsHash = "sha256-JxBrO7BSif/9sqzCYEPSnUi8/kWzUw+V41ygetvm0vs=";
            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out
            '';
          };
        dataDir = pkgs.stdenv.mkDerivation
            {
              pname = "data-directory";
              version = "btw-2025";
              src = ./.;
              installPhase =
                let
                  toElectionCopyString = election:
                    "cp ${byElection election} $out/election/${election}.json";
                in ''
                  mkdir -p $out/election
                  cp ${mission_statements} $out/mission_statements.json
                  cp ${party_platforms} $out/party_platforms.json
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
