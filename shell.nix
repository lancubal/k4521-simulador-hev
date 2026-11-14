{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    (pkgs.python3.withPackages (ps: with ps; [
      numpy
      matplotlib
      pytest
    ]))
  ];
}
