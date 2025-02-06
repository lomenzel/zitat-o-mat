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
            metadata = lines
              |> head
              |> fromJSON
              ;
            phrases = tail lines
              |> map (l: lib.trim l)
              |> filter (l: l != "" && ! lib.hasPrefix "# " l)
              |> map (replaceStrings (withArticles metadata.party) (repeat "[Parteiname]" 5))
              ;
          in
            metadata // { inherit phrases;};
      in
      {
        packages = rec {
          default = btw-quizz;
          btw-quizz = pkgs.stdenv.mkDerivation
            {
              pname = "btw-quizz";
              version = "0.1";
              src = ./src;
              installPhase = ''
                mkdir -p $out
                cp -r $src/* $out/
                cp -f ${data} $out/data.json
              '';
            };
          data = pkgs.writeText "data.json" (lib.filesystem.listFilesRecursive ./resources
            |> map parseProgramFile
            |> toJSON
          );
        };

        devShell = pkgs.mkShell
          {
            nativeBuildInputs = with pkgs; [
              nodejs
            ];
          };
      }
    );
}
