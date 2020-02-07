/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed;

import snakeed.component.Component;
import snakeed.component.Button;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import snakeed.scene.Scene;

/**
 *
 * @author Damian
 */

//extend scene
public class Popup{
    
    public enum Type{
        SPEECH, UTILITY;
    }
    private ActionListener parent;
    private Dimension minimumSize;
    private Point location;
    private int stemLocationPercent;
    private boolean stemUp = false;
    private boolean hasStem = false;
    private boolean visible = true;
    private Type popupType;
    private ArrayList<Component> items;
    private ArrayList<Tile> tiles;
    private ArrayList<String> text;
    
    public Popup(Point loc){
        location = loc;
        text = new ArrayList<>();
        tiles = new ArrayList<>();
        items = new ArrayList<>();
        minimumSize = new Dimension(300, 300);
    }
    
    public Popup(Point loc, Dimension d){
        this(loc);
        minimumSize = d;
    }

    public ActionListener getParent() {
        return parent;
    }

    public void setParent(ActionListener parent) {
        this.parent = parent;
    }
    
    public Dimension getMinimumSize() {
        return minimumSize;
    }

    public void setMinimumSize(Dimension size) {
        this.minimumSize = size;
    }

    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
    }

    public Type getPopupType() {
        return popupType;
    }

    public void setPopupType(Type popupType) {
        this.popupType = popupType;
    }

    public int getStemLocationPercent() {
        return stemLocationPercent;
    }

    public void setStemLocationPercent(int stemLocationPercent) {
        this.stemLocationPercent = stemLocationPercent;
    }

    public boolean isStemUp() {
        return stemUp;
    }

    public void setStemUp(boolean stemUp) {
        this.stemUp = stemUp;
    }

    public boolean doesHaveStem() {
        return hasStem;
    }

    public void setHasStem(boolean hasStem) {
        this.hasStem = hasStem;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }
    
    public void onMouseMove(MouseEvent e){
        Button b;
        for(int i = 0; i < items.size(); i++){
            if(items.get(i) instanceof Button){
                b = (Button)items.get(i);
                if(b.contains(e.getPoint())){
                    b.setFocused();
                }
                else{
                    b.setUnfocused();
                }
            }
        }
    }
    
    public void onMousePress(MouseEvent e){
        Button b;
        for(int i = 0; i < items.size(); i++){
            if(items.get(i) instanceof Button){
                b = (Button)items.get(i);
                if(b.contains(e.getPoint())){
                    b.clickButton();
                }
            }
        }
    }
     
    public void onMouseRelease(MouseEvent e){
        Button b;
        for(int i = 0; i < items.size(); i++){
            if(items.get(i) instanceof Button){
                b = (Button)items.get(i);
                
                if(b.contains(e.getPoint())){
                b.releaseButton();
                parent.actionPerformed(new ActionEvent(b, 10, "buttonPressed"));
                }
                else{
                    b.setUnfocused();
                }
            }
        }
    }
    
     
    public void addButton(Button b, int percentX,int percentY){
        b.setLocationMidPercent(percentX, percentY, minimumSize.width, minimumSize.height);
        b.hitBox.x += (location.x - minimumSize.width/2);
        b.hitBox.y += (location.y - minimumSize.height/2);
        b.midPoint.x = b.hitBox.x + b.hitBox.width/2;
        b.midPoint.y = b.hitBox.y + b.hitBox.height/2;
        b.setSelectionArrows(false);
        b.setParent(parent);
        items.add(b);
    }
    
    
    public void addTile(Tile t, int percentX, int percentY){
        t.setAbsolutePosition(true);
        Point p = t.getLocation();
        
        p.x = (location.x - minimumSize.width/2);
        p.y = (location.y - minimumSize.height/2);
        p.x += (minimumSize.width * percentX) / 100;
        p.y += (minimumSize.height * percentY) / 100;
        
        
        if(p.y < location.y - minimumSize.height/2){
            p.y = (location.y - minimumSize.height/2);
        }
        else if(p.y + t.getScreenHeight() > location.y + minimumSize.height/2){
            p.y = (location.y + minimumSize.height/2) -  t.getScreenHeight();
        }
        
        if(p.x < location.x - minimumSize.width/2){
            p.x = (location.x - minimumSize.width/2) + t.getScreenWidth();
        }
        else if(p.x + t.getScreenWidth() > location.x + minimumSize.width/2){
            p.x = (location.x + minimumSize.width/2) - t.getScreenWidth();
        }
        
        t.setLocation(p);
        tiles.add(t);
    }
   
    
    
    public void println(String text){
        this.text.add(text);
    }
    
    public void setText(String text){
        char[] textChars = text.toCharArray();
        int numberOfNewlines = 0;
        
        for(int i = 0; i < textChars.length; i++){
            if(text.charAt(i) == '\n'){
                numberOfNewlines++;
            }
        }
        
        for(int i = 0; i < numberOfNewlines; i++){
            this.text.add(text.substring(0, text.indexOf("\n")));
            text = text.substring(text.indexOf("\n")+1);
        }
        this.text.add(text);
    }
    
    
    public void drawBubble(Graphics2D g2d, BufferedImage tiles){
        
        g2d.setFont(GraphicsPanel.buttonFont.deriveFont(GraphicsPanel.bubbleFontSize));
        FontMetrics fm = g2d.getFontMetrics();
        
        int sx1;
        int sy1;
                
        int sx2;
        int sy2;
                
        int dx1;
        int dy1;
                
        int dx2;
        int dy2;
        
        if(popupType == Type.SPEECH){
             Rectangle textSpace = new Rectangle();
             for(String s: text){
                 if(fm.stringWidth(s) > textSpace.width){
                 textSpace.width = fm.stringWidth(s);
                 }
                 textSpace.height += fm.getHeight();
             }
             sx1 = 211;
             sy1 = 3;
             sx2 = 214;
             sy2 = 6;
             
             dx1 = location.x-textSpace.width/2;
             dy1 = location.y-textSpace.height/2;
             dx2 = dx1 + textSpace.width;
             dy2 = dy1 + textSpace.height;
             //textbackground
             g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
             
             g2d.setColor(Color.BLACK);
             int textY = dy1;
             for(String s: text){
                 g2d.drawString(s, dx1, textY + fm.getHeight());
                 textY += fm.getHeight();
             }
             
            //leftcornertop
            g2d.drawImage(tiles, dx1-20, dy1-20, dx1, dy1, 208, 0, 211, 3, null);
            //leftside
            g2d.drawImage(tiles, dx1-20, dy1, dx1, dy1+textSpace.height, 208, 3, 211, 6, null);
            //leftcornerbottom
            g2d.drawImage(tiles, dx1-20, dy1+textSpace.height, dx1, dy1+textSpace.height+20, 208, 6, 211, 9, null);
            
            //topside
            g2d.drawImage(tiles, dx1, dy1-20, dx2, dy1, 211, 0, 214, 3, null);
            //bottomside
            g2d.drawImage(tiles, dx1, dy1+textSpace.height, dx2, dy1+textSpace.height+20, 211, 6, 214, 9, null);
            
            //leftcornertop
            g2d.drawImage(tiles, dx1+textSpace.width, dy1-20, dx1+textSpace.width+20, dy1, 214, 0, 217, 3, null);
            //leftside
            g2d.drawImage(tiles, dx1+textSpace.width, dy1, dx1+textSpace.width+20, dy1+textSpace.height, 214, 3, 217, 6, null);
            //leftcornerbottom
            g2d.drawImage(tiles, dx1+textSpace.width, dy1+textSpace.height, dx1+textSpace.width+20, dy1+textSpace.height+20, 214, 6, 217, 9, null);
            
            if(hasStem){
                    sx1 = 241;
                    sy1 = 2;
                    sx2 = 246;
                    sy2 = 11;
                if(stemUp){
                    
                    dx1 = location.x-textSpace.width/2;
                    dy1 = location.y-textSpace.height/2;
                    dy1 = dy1 - 70;
                    dx1 = dx1 + ((stemLocationPercent * textSpace.width) / 100) - 20;
                    dx2 = dx1 + 25;
                    dy2 = dy1 + 57;
                }
                else{

                    dx1 = location.x-textSpace.width/2;
                    dy1 = location.y+textSpace.height/2;
                    dy1 = dy1 + 70;
                    dx1 = dx1 + ((stemLocationPercent * textSpace.width) / 100) - 20;
                    dx2 = dx1 + 25;
                    dy2 = dy1 - 57;
                }
                
                g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
            }
        }
        else if(popupType == Type.UTILITY){
            for(String s: text){
                 if(fm.stringWidth(s) > minimumSize.width){
                 minimumSize.width = fm.stringWidth(s);
                 }
             }
            
            sx1 = 220;
            sy1 = 3;
            sx2 = 223;
            sy2 = 6;

            dx1 = location.x-minimumSize.width/2;
            dy1 = location.y-minimumSize.height/2;
            dx2 = dx1 + minimumSize.width;
            dy2 = dy1 + minimumSize.height;
            //textbackground
            g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
            
            if(Engine.debugScene){
                g2d.drawRect(dx1+1, dy1+1, minimumSize.width-2, minimumSize.height-2);
            }

            
            int textY = dy1;
            for(String s: text){
                g2d.setColor(Color.WHITE);
                g2d.drawString(s, dx1, textY + fm.getHeight());
                    if(Engine.debugScene){
                    g2d.setColor(Color.BLUE);
                    g2d.drawRect(dx1, textY, fm.stringWidth(s), fm.getHeight());
                    }
                textY += fm.getHeight();
            }
            g2d.setColor(Color.MAGENTA);
            //leftcornertop
            g2d.drawImage(tiles, dx1-20, dy1-20, dx1, dy1, 217, 0, 220, 3, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1-20, dy1-20, 20, 20);
            }
            //leftside
            g2d.drawImage(tiles, dx1-20, dy1, dx1, dy1+minimumSize.height, 217, 3, 220, 6, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1-20, dy1, 20, minimumSize.height);
            }
            //leftcornerbottom
            g2d.drawImage(tiles, dx1-20, dy1+minimumSize.height, dx1, dy1+minimumSize.height+20, 217, 6, 220, 9, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1-20, dy1+minimumSize.height, 20, 20);
            }
            //topside
            g2d.drawImage(tiles, dx1, dy1-20, dx2, dy1, 220, 0, 223, 3, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1, dy1-20, minimumSize.width, 20);
            }
            //bottomside
            g2d.drawImage(tiles, dx1, dy1+minimumSize.height, dx2, dy1+minimumSize.height+20, 220, 6, 223, 9, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1, dy1+minimumSize.height, minimumSize.width, 20);
            }
            //leftcornertop
            g2d.drawImage(tiles, dx1+minimumSize.width, dy1-20, dx1+minimumSize.width+20, dy1, 223, 0, 226, 3, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1+minimumSize.width, dy1-20, 20, 20);
            }
            //leftside
            g2d.drawImage(tiles, dx1+minimumSize.width, dy1, dx1+minimumSize.width+20, dy1+minimumSize.height, 223, 3, 226, 6, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1+minimumSize.width, dy1, 20, minimumSize.height);
            }
            //leftcornerbottom
            g2d.drawImage(tiles, dx1+minimumSize.width, dy1+minimumSize.height, dx1+minimumSize.width+20, dy1+minimumSize.height+20, 223, 6, 226, 9, null);
            if(Engine.debugScene){
                g2d.drawRect(dx1+minimumSize.width, dy1+minimumSize.height, 20, 20);
            }
            
            for(Component c: items){
                c.drawComponent(g2d, tiles);
            }
            for(Tile t: this.tiles){
                t.drawTile(g2d, tiles, 0, 0);
            }
        }
        
    }
    
}
