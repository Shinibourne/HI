# Stick Nodes Animation Forge — Claude Skill

This package teaches Claude how to create new Stick Nodes `.stknds` animations from a supplied corpus of working projects.

## How to use

Give Claude:

1. this skill package;
2. all of your known-good `.stknds` projects;
3. any `.nodes` assets you want used;
4. a plain-English animation request.

Example request:

> "Make a ball bounce twice, with squash on impact and a short settle. Do not copy any template animation."

Claude should use the templates only to learn the file format and preserve application-compatible structure.

## Important

The `.stknds` files are reference material. They are not meant to be copied as animations.

The skill emphasizes controlled binary experiments because an apparently valid `.stknds` can still fail to open or can animate the wrong node.
