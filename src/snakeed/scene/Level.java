/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.scene;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import snakeed.Collectable;
import snakeed.DebugConsole;
import snakeed.Direction;
import snakeed.GraphicsPanel;
import snakeed.Options;
import snakeed.Snake;
import snakeed.Tile;


public class Level extends Scene{
    
    private ArrayList<Point> border;
    private ArrayList<Collectable> items;
    private ArrayList<Point> freeSpace;
    private ArrayList<Snake> snakes;
    private ArrayList<Tile> tiles;
    
    private boolean secondFrame = false;
    
    public int yOffset = 0;
    public int xOffset = 0;
    
    
    public Level(Insets ins, Color c, Tile bg){
        super(bg,c);
        border = new ArrayList<>();
        items = new ArrayList<>();
        snakes = new ArrayList<>();
        freeSpace = new ArrayList<>();
        tiles = new ArrayList<>();
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        super.onKeypress(evt);
        if(evt.getKeyCode() == KeyEvent.VK_ESCAPE){
            
        }
        else{
            Direction d = Options.getDirectionByKeyEvent(evt);
            int player = Options.getPlayerByKeyevent(evt);
            if(d != null && d != getInverseSnakeDirection(player)){
                turnSnake(player, d);
            }
        }
    }
    
    
    public void advanceSnakes(){
        for(Snake s: snakes){
            s.advanceSnake();
        }
    }
    
    public void turnSnake(int player, Direction d){
        snakes.get(player - 1).setMovingDirection(d);
    }
	
    public void setSnake(Snake s){
        snakes.add(s);
        getFreeSpace();
    }
    
    public void setSnake(ArrayList<Snake> players){
        snakes = players;
        getFreeSpace();
    }

    public void setItems(Collectable c) {
        items.add(c);
        getFreeSpace();
    }
    

    @Override
    public void setSizeInTiles(Dimension d) {
       
        sizeX = d.width;
        sizeY = d.height;
        
        border.clear();
        for(int x = 0; x < sizeX; x++){
            border.add(new Point(x,0));
            border.add(new Point(x,sizeY - 1));
        }
        
        for(int y = 1; y < sizeY - 1; y++){
            border.add(new Point(0,y));
            border.add(new Point(sizeX - 1, y));
        }
        super.setSizeInTiles(new Dimension(d.width + xOffset,d.height + yOffset));
        getFreeSpace();
    }  
    
    
    public ArrayList<Tile> getTiles(){
           tiles.clear();
        
           for(Point p: border){
               tiles.add(new Tile(p,new Point(0,1)));
           }
           
           for(Collectable c: items){
               tiles.add(c.getTile());
           }
           
           for(Snake s: snakes){
               for(Tile t: s.getTiles()){
               tiles.add(t);
               }
           }
           
           return tiles;
    }
    
    
    public ArrayList<Collectable> getCollectables(){
        return items;
    }
    
    public ArrayList<Point> getBorder(){
        return border;
    }
    
    public ArrayList<Snake> getSnakes(){
        return snakes;
    }
    
    public ArrayList<Point> getFreeSpace(){
        freeSpace.clear();
        
        for(int y = 1; y < sizeTilesY - 1; y++){
            for(int x = 1; x < sizeTilesX - 1; x++){
            freeSpace.add(new Point(x,y));
            }
        }
        if(snakes.size() > 0){
            for(Snake s: snakes){
                for(Point p: s.getSegmentLocation()){
                    if(freeSpace.contains(p)){
                        freeSpace.remove(p);
                    }
                }
            }
        }
        
        if(items.size() > 0){
            for(Collectable s: items){
                if(freeSpace.contains(s.getLocation())){
                    freeSpace.remove(s.getLocation());
                }
            }
        }
        
        return freeSpace;
    }
    
    public int getfreeSpacesNumber(){
        return freeSpace.size();
    }
    
    public Direction getSnakeDirection(int player){
            return snakes.get(player - 1).getCurrentMovingDirection();
    }

    public Direction getInverseSnakeDirection(int player){
            return snakes.get(player - 1).getInverseMovingDirection();
    }

    public int getyOffset() {
        return yOffset;
    }

    public void setyOffset(int yOffset) {
        this.yOffset = yOffset;
    }

    public int getxOffset() {
        return xOffset;
    }

    public void setxOffset(int xOffset) {
        this.xOffset = xOffset;
    }

 
    @Override
    public Dimension getScreenSize() {
        Dimension d = super.getScreenSize();
        d.height += yOffset;
        d.width += xOffset;
        return d;
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        super.actionPerformed(e);
        switch(e.getActionCommand()){
            case "ingame":
                advanceSnakes();
                break;
            case "debug_ingame":
                advanceSnakes();
                debugSnake();
                break;
            case "resume":
                popup.setVisible(false);
                unfreeze();
                break;
        }
    }

    
    @Override
    public void paintScene(Graphics2D g2d, BufferedImage tiles) {
        for(Tile t: getTiles()){
                t.drawTile(g2d, tiles, xOffset, yOffset);
                t.elapseTime();
            }
        if(popup != null){
            if(popup.isVisible()){
            popup.drawBubble(g2d, tiles);
            }
        }
        super.paintScene(g2d, tiles);
    }
    
    private void debugSnake(){
        DebugConsole.cls();
        DebugConsole.println("-----Debug mode(space to exit)-----");
        Snake s = getSnakes().get(0);
        for(int i =0; i <= s.getSnakeLength(); i++){
            DebugConsole.println(s);
            DebugConsole.println("Seg no " + i + 
                    " | Position X:" + s.getSegmentLocation().get(i).x +
                    " | Position Y:" + s.getSegmentLocation().get(i).y +
                    " | Direcion " + s.getSegmentDirection().get(i) +
                    " | Tile " + s.getTiles().get(i).toString());
        }
    }
}
