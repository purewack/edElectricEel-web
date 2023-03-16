import { Container, Sprite, TilingSprite } from "@pixi/react";

export default function Boat({ sprites, visuals }) {
  const { grid, uu, u } = visuals;
  const sc = { x: u, y: u };

  return (
    <Container x={Math.floor(grid[0] - 3) * uu} y={uu}>
      <Sprite texture={sprites.entity.soundboat} scale={sc} />
      <Sprite
        texture={
          visuals.chainType === "wire"
            ? sprites.entity.soundboat_hookwire
            : sprites.entity.soundboat_hookchain
        }
        scale={sc}
        x={uu * 2}
      />
      <TilingSprite
        texture={
          visuals.chainType === "wire"
            ? sprites.entity.wire
            : sprites.entity.chain
        }
        x={uu * 2}
        y={uu * 1}
        scale={sc}
        width={8}
        height={8*visuals.chainLength || 0}
      />
    </Container>
  );
}
