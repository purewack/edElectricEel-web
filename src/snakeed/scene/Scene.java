/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.scene;

import snakeed.component.ComponentGroup;
import snakeed.component.Component;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import javax.swing.Timer;
import snakeed.*;

/**
 *
 * @author damian
 */
public class Scene implements ActionListener, Debuggable{

    public int sizeX;
    public int sizeY;
    public int sizeTilesX;
    public int sizeTilesY;
    public Tile background;
    public Color bgColor;
    public ActionListener parent;
    
    public String actionCommand = "";
    public Timer sceneTick;
    public Popup popup = null;
    public ArrayList<Component> staticComp;
    public ArrayList<Component> interactComp;
    public ArrayList<ComponentGroup> staticGroup;
    
    public Scene(Tile bg, Color bgC) {
        staticComp = new ArrayList<>();
        interactComp = new ArrayList<>();
        staticGroup = new ArrayList<>();
        background = bg;
        bgColor = bgC;
        sceneTick = new Timer(Options.getGeneralInt("snake_timer"), this);
        sceneTick.setActionCommand("ingame");
    }
    
    public Scene(Color bgC){
        this(null, bgC);
    }
   

    public ActionListener getParent() {
        return parent;
    }

    public void setParent(ActionListener parent) {
        this.parent = parent;
    }
    
    public int getSizeX(){
        return sizeX;
    }
    
    public int getSizeY(){
        return sizeY;
    }
    
    public Dimension getScreenSize(){
        return new Dimension(sizeX, sizeY);
    }
    
    public Point getMidPoint(){
        return new Point(sizeX/2, sizeY/2);
    }
    
    
    public void setSize(Dimension sizeInPx) {
        sizeX = sizeInPx.width;
        sizeY = sizeInPx.height;
    } 
    
    public void setSizeInTiles(Dimension sizeInTiles) {
        sizeTilesX = sizeInTiles.width;
        sizeTilesY = sizeInTiles.height;
        sizeX = sizeInTiles.width * Options.getGraphicInt("tile_size_screen");
        sizeY = sizeInTiles.height * Options.getGraphicInt("tile_size_screen");
    } 
    
    public void setSizeInTiles(int width, int height) {
        sizeTilesX = width;
        sizeTilesY = height;
        sizeX = width * Options.getGraphicInt("tile_size_screen");
        sizeY = height * Options.getGraphicInt("tile_size_screen");
    } 

    public Tile getBackground() {
        return background;
    }

    public void setBackground(Tile background) {
        this.background = background;
    }

    public Color getBgColor() {
        return bgColor;
    }

    public void setBgColor(Color bgColor) {
        this.bgColor = bgColor;
    }
 

    public String getActionCommand() {
        return actionCommand;
    }

    public void setActionCommand(String actionCommand) {
        this.actionCommand = actionCommand;
    }

    public Popup getPopup() {
        return popup;
    }

    public void setPopup(Popup popup) {
        this.popup = popup;
        this.popup.setParent(this);
     }

    public void addInteractiveComponent(Component c){
        interactComp.add(c);
    }
    
    public void addStaticComponent(Component c){
        staticComp.add(c);
    }
    
    public void addComponentGroup(ComponentGroup cg){
        staticGroup.add(cg);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if(e.getActionCommand().equals("back")){
                freeze();
                if(popup != null){
                popup.setVisible(false);
                }
                parent.actionPerformed(new ActionEvent(this, Engine.ACTION_ID_SCENE, "back"));
        }
        else if(e.getActionCommand().equals("console_folded")){
            unfreeze();
        }
    }
    
    public void onKeypress(KeyEvent evt){
        if(evt.getKeyCode() == KeyEvent.VK_ESCAPE && popup != null){
            if(!popup.isVisible()){
            popup.setVisible(true);
            freeze();
            }
            else if(popup.isVisible()){
            popup.setVisible(false);
            unfreeze();
            }
        }
    }
    
    public boolean onMouseMove(MouseEvent e){
        if(popup != null && popup.isVisible() && popup.getPopupType() == Popup.Type.UTILITY){
            popup.onMouseMove(e);
            return true;
        }
        return false;
    }
    
    public boolean onMousePress(MouseEvent e){
        if(popup != null && popup.isVisible() && popup.getPopupType() == Popup.Type.UTILITY){
            popup.onMousePress(e);
            return true;
        }
        return false;
    }
     
    public boolean onMouseRelease(MouseEvent e){
        if(popup != null && popup.isVisible() && popup.getPopupType() == Popup.Type.UTILITY){
            popup.onMouseRelease(e);
            return true;
        }
        return false;
    }

    public void paintBackground(Graphics2D g2d, BufferedImage tiles) {
        
        if(background != null){
            int width = background.getScreenWidth();
            int height = background.getScreenHeight();
            Point s = background.getFrame(background.currentFrame);
            int sWidth = background.getWidth();
            int sHeight = background.getHeight();
            
            g2d.setColor(Color.BLUE);
            for(int y = 0; y < sizeY; y+=height){
                for(int x = 0; x < sizeX; x+=width){
                    g2d.drawImage(tiles, x, y, x+width, y+height, s.x, s.y, s.x+sWidth, s.y+sHeight, null);
                    if(Engine.debugScene){
                    g2d.drawRect(x, y, width, height);
                    }
                }
            }
            if(!Engine.debugScene){
            background.elapseTime();
            }
        }
        
    }
    
    public void paintScene(Graphics2D g2d, BufferedImage tiles){
        paintBackground(g2d, tiles);
        for(Component c: interactComp){
            c.drawComponent(g2d, tiles);
        }
        for(Component c: staticComp){
            c.drawComponent(g2d, tiles);
        }
        
        for(ComponentGroup c: staticGroup){
            c.drawGroup(g2d, tiles);
        }
        if(popup != null){
            if(popup.isVisible()){
            popup.drawBubble(g2d, tiles);
            }
        }
        
        if(Engine.debugScene){
            paintDebug(g2d);
        }
    }

    @Override
    public void paintDebug(Graphics2D g2d) {
        g2d.setColor(Color.RED);
        g2d.drawRect(0, 0, sizeX, sizeY);
        g2d.setFont(GraphicsPanel.consoleFont.deriveFont(GraphicsPanel.consoleFontSize));
        g2d.setColor(Color.BLUE);
        g2d.drawString(String.format("scene Width:%d Height:%d", sizeX, sizeY), sizeX/2, sizeY/2 -40);
        g2d.drawString(String.format("midpoint X:%d Y:%d", sizeX/2, sizeY/2), sizeX/2, sizeY/2 + GraphicsPanel.g.getFontMetrics().getHeight() -40);
        g2d.setColor(Color.RED);
        g2d.drawLine(sizeX/2 - 5, sizeY/2 - 5, sizeX/2 + 5, sizeY/2 + 5);
        g2d.drawLine(sizeX/2 - 5, sizeY/2 + 5, sizeX/2 + 5, sizeY/2 - 5);
    }
    
    
    
    public void freeze(){
        sceneTick.stop();
        for(Component c: interactComp){
            c.active = false;
        }
    }
    
    public void unfreeze(){
        sceneTick.setActionCommand("ingame");
        sceneTick.start();
        for(Component c: interactComp){
            c.active = true;
        }
    }
}
