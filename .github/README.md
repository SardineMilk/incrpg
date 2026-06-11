<h1 align="center">
  IncRPG (WIP)
</h1>

IncRPG (Incredible Rat Punching Game) is a semi-idle text-based rpg inspired by [Proto 23](https://23html.github.io/) and [Yet Another Idle RPG](https://miktaew.github.io/yet-another-idle-rpg/).

It features a robust data-driven config system that allows new content to be rapidly created without increasing backend complexity and tech-debt (much. hopefully.).

## Features

Actions,
Skills,
Traits,
Conditions

## Running

### Run Locally

IncRPG is written using HTML, CSS and vanilla JS only.

This means running the game locally is simple: Just open index.html in a live server.

For this purpose, [npm live server](https://www.npmjs.com/package/live-server), [vsCode live server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or similar can be used.

### Host Using Github Pages

The easiest way to share your version of IncRPG is using Github Pages.

This hosts the page for free, at "username.github.io/repository-name".

You can activate this on your fork by going to Settings > Pages > Deploy From Branch and selecting Main.

## Modding

Due to the data-driven structure, creating your own content is easy.

All content is stored in src/data/\*.js files as structured objects.

Adding to or modifying these objects will apply to the game on next reload.

## Contribution

I welcome all community contributions, from simple grammar fixes to entire content expansions.

However if you wish to alter existing content, I recommend opening an issue first to discuss the proposed changes before implementing them.
