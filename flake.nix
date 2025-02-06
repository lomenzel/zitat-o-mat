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
      let
        pkgs = import nixpkgs { inherit system; };
        lib = pkgs.lib;
        parseProgramFile = path: 
          let
            content = builtins.readFile path;
            lines = lib.splitString "\n" content;
            metadata = lines
              |> builtins.head
              |> builtins.fromJSON
              ;
            phrases = builtins.tail lines
              |> builtins.map (l: lib.trim l)
              |> builtins.filter (l: l != "")
              ;
          in
            metadata // { inherit phrases;};
      in
      {
        packages = rec {
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
            |> builtins.toJSON
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
