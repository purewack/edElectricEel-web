package snakeed;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

public class Tile {
    private boolean animated = false;
    private boolean absolutePosition = false;
    private boolean absoluteTileCoords = false;
    private int time = 0;
    private int width;
    private int height;
    private int sWidth;
    private int sHeight;
    public int currentFrame = 0; 
    private ArrayList<Integer> frameTime;
    private ArrayList<Point> animTileSet;
    private Point tileScreen;
    private boolean visible = true;  

    public Tile(){
        animTileSet = new ArrayList<>();
        frameTime = new ArrayList<>();
        tileScreen = new Point();
        width = Options.getGraphicInt("tile_size_px");
        height = width;
        sWidth = Options.getGraphicInt("tile_size_screen");
        sHeight = sWidth;
    }
    
    public Tile(Point position){
        this();
    }
    
    public Tile(Point position, Point tileIcon){
        this();
        tileScreen.setLocation(position);
        addFrame(tileIcon, 0);
    }
    
    public Tile(Point position, Point tileIcon, Dimension tileIconSizePx){
        this(position, tileIcon);
        height = tileIconSizePx.height;
        width = tileIconSizePx.width;
    }
    
    public Tile(Point absolutePosition, Rectangle absoluteTileIcon){
        this();
        tileScreen.setLocation(absolutePosition);
        this.absolutePosition = true;
        this.absoluteTileCoords = true;
        height = absoluteTileIcon.height;
        width = absoluteTileIcon.width;
        addFrame(new Point(absoluteTileIcon.x,absoluteTileIcon.y), 0);
    }
    
    public Tile(Rectangle absolutePosition, Rectangle absoluteTileIcon){
        this();
        tileScreen.setLocation(absolutePosition.getLocation());
        this.absolutePosition = true;
        this.absoluteTileCoords = true;
        sHeight = absolutePosition.height;
        sWidth = absolutePosition.width;
        height = absoluteTileIcon.height;
        width = absoluteTileIcon.width;
        addFrame(new Point(absoluteTileIcon.x,absoluteTileIcon.y), 0);
    }

    public boolean isAnimated() {
        return animated;
    }

    public void setIsAnimated(boolean isAnimated) {
        this.animated = isAnimated;
    }

    public boolean isAbsolutePosition() {
        return absolutePosition;
    }

    public void setAbsolutePosition(boolean absolutePosition) {
        this.absolutePosition = absolutePosition;
    }

    public boolean isAbsoluteTileCoords() {
        return absoluteTileCoords;
    }

    public void setAbsoluteTileCoords(boolean absoluteTileCoords) {
        this.absoluteTileCoords = absoluteTileCoords;
    }

    public int getFrameTime(int frame) {
        return frameTime.get(frame);
    }

    public ArrayList<Point> getAnimTileSet() {
        return animTileSet;
    }

    public Point getFirstFrame() {
        return animTileSet.get(0);
    }
    
    public Point getFrame(int frame) {
        return animTileSet.get(frame);
    }
    
    public void setAnimTileSet(ArrayList<Point> animTileSet) {
        this.animTileSet = animTileSet;
    }
    
    public void clearAnimTileSet(){
        animTileSet.clear();
    }
    
    public final void addFrame(Point tileIcon, int time){
        animTileSet.add(tileIcon);
        frameTime.add(time);
    }

    
    public final void overwriteFrame(int frameIndex, Point tileIcon, int time){
        animTileSet.remove(frameIndex);
        frameTime.remove(frameIndex);
        animTileSet.add(frameIndex, tileIcon);
        frameTime.add(frameIndex, time);
    }
    
    public Point getTileScreen() {
        return tileScreen;
    }
    
    public void setTileSize(Dimension d){
        height = d.height;
        width = d.width;
    }
    
    public void setTileScreenSize(Dimension d){
        sHeight = d.height;
        sWidth = d.width;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getScreenWidth() {
        return sWidth;
    }

    public int getScreenHeight() {
        return sHeight;
    }
    
    public void setLocation(Point loc){
        this.tileScreen.setLocation(loc);
    }
    
    public Point getLocation(){
        return this.tileScreen.getLocation();
    }
    
    public Point getMidpoint(){
        return new Point(tileScreen.x+(sWidth/2),
                        tileScreen.y+(sHeight/2));
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }
    
    @Override
    public String toString() {
        return String.format("tileX:%d tileY:%d", animTileSet.get(0).x, animTileSet.get(0).y);
    }
    
    public void drawTile(Graphics2D g2d, BufferedImage tileImg, int xOffset, int yOffset){
        if(visible){    
            Point s = getFrame(currentFrame);
            Point d = getTileScreen();
            
            int dx1 = 0;
            int dy1 = 0;
            int dx2 = 0;
            int dy2 = 0;
            int sx1 = 0;
            int sy1 = 0;
            int sx2 = 0;
            int sy2 = 0;
            
            
            sx1 = s.x * width;
            sy1 = s.y * height;
            sx2 = sx1 + width;
            sy2 = sy1 + height;
            
            if(!absolutePosition){
                dx1 = (d.x * sWidth) + xOffset;
                dy1 = (d.y * sHeight) + yOffset;
            }
            else{
                dx1 = d.x;
                dy1 = d.y;
            }
            dx2 = dx1 + sWidth;
            dy2 = dy1 + sHeight;
            
            g2d.drawImage(tileImg, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
            
            if(Engine.debugScene){
            g2d.setColor(Color.red);
            g2d.drawRect(dx1, dy1, sWidth, sHeight);
            g2d.setColor(Color.yellow);
            g2d.drawOval(dx1+sWidth/4, dy1+sHeight/4, sWidth/2, sHeight/2);
            }
        }
    }

    public void elapseTime() {
        if(animated){
            time += GraphicsPanel.fpsInMs;
            if(time >= frameTime.get(currentFrame)){
                time = 0;
                currentFrame++;
                if(currentFrame > animTileSet.size() - 1){
                    currentFrame = 0;
                }
            }
        }
    }

}
