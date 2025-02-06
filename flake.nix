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
          btwQuizz = pkgs.stdenv.mkDerivation
            {
              pname = "btwQuizz";
              version = "0.1";
              src = ./.;
              installphase = ''
                # mkdir -p $out/wahlprogramme
                # cp -r $src/* $out/
                # cp -r ${./wahlprogramme}/* $out/wahlprogramme
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
