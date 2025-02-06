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
      in
      {
        packages = rec {
          btw-quizz = pkgs.stdenv.mkDerivation
            {
              pname = "btw-quizz";
              version = "0.1";
              src = ./src;
              installPhase = ''
                mkdir -p $out/wahlprogramme
                cp -r $src/* $out/
                cp -r ${./resources/wahlprogramme}/* $out/wahlprogramme
              '';
            };
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
