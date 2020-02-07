/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.scene;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.event.MouseWheelEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import snakeed.component.Component;
import snakeed.component.ComponentGroup;
import snakeed.GraphicsPanel;
import snakeed.Tile;

/**
 *
 * @author damian
 */
public class ScrollMenu extends Menu{
    
    private Component lowestComp;
    private final int scrollDistPx = 10;
    private final int paddingLowestCompPos = 120;
    private int lowestCompPos = 0;
    private int verticalOffset = 0;
    private float sliderPos = 0;
    private boolean barFaded = false;
    private boolean compsOutside = false;
    public int titleHeight;
    
    public ArrayList<Component> movingStaticComp;
    public ArrayList<Component> movingInteractComp;
    public ArrayList<ComponentGroup> movingGroup;
    
    public ScrollMenu(Color c, Tile bg) {
        super(c, bg);
        movingInteractComp = new ArrayList<>();
        movingStaticComp = new ArrayList<>();
        movingGroup = new ArrayList<>(); 
        lowestCompPos = sizeY;
        titleHeight = GraphicsPanel.g.getFontMetrics(GraphicsPanel.buttonFont.deriveFont(GraphicsPanel.groupFontSize)).getHeight();
    }

    public ScrollMenu(Color c) {
        this(c,null);
    }

    public ArrayList<Component> getMovingStaticComponent() {
        return movingStaticComp;
    }
    
    public ArrayList<Component> getMovingInteractiveComponent() {
        return movingInteractComp;
    }
    
    public void addMovingGroup(ComponentGroup c) {
        movingGroup.add(c);
        int compY = c.boundBox.y + c.boundBox.height + paddingLowestCompPos;
        if(compY > lowestCompPos){
            lowestCompPos = compY;
            lowestComp = c.getLowestComp();
        }
        if(lowestCompPos > sizeY){
            compsOutside = true;
        }
    }

    public void addMovingStaticComponent(Component c) {
        movingStaticComp.add(c);
        int compY = c.getLocation().y + c.hitBox.height + paddingLowestCompPos;
        if(compY > lowestCompPos){
            lowestCompPos = compY;
            lowestComp = c;
        }
        if(lowestCompPos > sizeY){
            compsOutside = true;
        }
    }

    public void addMovingInteractiveComponent(Component c) {
        movingInteractComp.add(c);
        int compY = c.getLocation().y + c.hitBox.height + paddingLowestCompPos;
        if(compY > lowestCompPos){
            if(compY > sizeY){
                lowestCompPos = compY;
                lowestComp = c;
            }
        }
        if(lowestCompPos > sizeY){
            compsOutside = true;
        }
    }

    @Override
    public void setSizeInTiles(Dimension sizeInTiles) {
        super.setSizeInTiles(sizeInTiles); //To change body of generated methods, choose Tools | Templates.
        verticalOffset = sizeY;
    }

    @Override
    public void setSizeInTiles(int width, int height) {
        super.setSizeInTiles(width, height); //To change body of generated methods, choose Tools | Templates.
        verticalOffset = sizeY;

    }

    @Override
    public void setSize(Dimension sizeInPx) {
        super.setSize(sizeInPx); //To change body of generated methods, choose Tools | Templates.
        verticalOffset = sizeY;

    }
    
    
    
    @Override
    public boolean onMouseMove(MouseEvent e) {
        for(Component c: movingInteractComp){
            c.onMouseMove(e);
        }
        for(ComponentGroup c: movingGroup){
            c.onMouseMove(e);
        }
        return super.onMouseMove(e);
    }

    @Override
    public boolean onMousePress(MouseEvent e) {
        for(Component c: movingInteractComp){
            c.onMousePress(e);
        }
        for(ComponentGroup c: movingGroup){
            c.onMousePress(e);
        }
        return super.onMousePress(e);
    }

    @Override
    public boolean onMouseRelease(MouseEvent e) {
        for(Component c: movingInteractComp){
            c.onMouseRelease(e);
        }
        for(ComponentGroup c: movingGroup){
            c.onMouseRelease(e);
        }
        return super.onMouseRelease(e); 
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        for(Component c: movingInteractComp){
            c.onKeypress(evt);
        }
        for(ComponentGroup c: movingGroup){
            c.onKeypress(evt);
        }
        super.onKeypress(evt);
    }

    
    public void onMouseWheelChange(MouseWheelEvent e){
        if(e.getScrollType() == MouseWheelEvent.WHEEL_UNIT_SCROLL){
            scroll(e.getWheelRotation() < 0);
            sliderPos = (float)(verticalOffset-sizeY) / (float)(lowestCompPos+-sizeY);
            sliderPos = sliderPos * 100;
        }
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
        switch(e.getActionCommand()){
            case "scrolling":
                barFaded = false;
                break;
            case "resting":
                barFaded = true;
                break;
        }
        super.actionPerformed(e);
    }
    
    
    
    private void scroll(boolean up){
        if(up){
            verticalOffset -= scrollDistPx;
            if(verticalOffset - sizeY >= 0){
                for(Component c: movingStaticComp){
                    c.setLocation(c.getLocation().x, c.getLocation().y + scrollDistPx);
                }
                for(Component c: movingInteractComp){
                    c.setLocation(c.getLocation().x, c.getLocation().y + scrollDistPx);
                }
                for(ComponentGroup c: movingGroup){
                    c.moveGroup(0, scrollDistPx);
                }
            }
            else{
                verticalOffset = sizeY;
            }
            
        }
        else{ //scroll down
            verticalOffset += scrollDistPx;
            if(verticalOffset <= lowestCompPos){
                for(Component c: movingStaticComp){
                    c.setLocation(c.getLocation().x, c.getLocation().y - scrollDistPx);
                }
                for(Component c: movingInteractComp){
                    c.setLocation(c.getLocation().x, c.getLocation().y - scrollDistPx);
                }
                for(ComponentGroup c: movingGroup){
                    c.moveGroup(0, -scrollDistPx);
                }
            }
            else{
                verticalOffset = lowestCompPos;
            }
        }
    }

    @Override
    public void paintScene(Graphics2D g2d, BufferedImage tiles) {
        super.paintScene(g2d, tiles);
        for(Component c: movingStaticComp){
            if(c.getLocation().y+c.hitBox.height >= 0 && c.getLocation().y <= sizeY){
            c.drawComponent(g2d, tiles);
            }
        }
        
        for(Component c: movingInteractComp){
            if(c.getLocation().y+c.hitBox.height >= 0 && c.getLocation().y <= sizeY){
            c.drawComponent(g2d, tiles);
            }
        }
        
        for(ComponentGroup c: movingGroup){
            if(c.boundBox.y+c.boundBox.height >= 0 && c.boundBox.y <= sizeY){
            c.drawGroup(g2d, tiles);
            }
        }
        if(compsOutside){
            if(barFaded){
                g2d.setColor(new Color(100,100,100,100));
            }
            else{        
                g2d.setColor(new Color(100,100,100));
            }
            g2d.setStroke(new BasicStroke(2));
            g2d.drawRect(sizeX - 20, 10, 15, sizeY - 20);
            g2d.setStroke(new BasicStroke(1));
            int slider = 12 + (((sizeY - 44) * (int)sliderPos)/ 100);
            g2d.fillRect(sizeX - 18, slider, 11, 20);
        }
        
    }

    @Override
    public void paintDebug(Graphics2D g2d) {
        super.paintDebug(g2d);
        
        g2d.setColor(Color.MAGENTA);
        g2d.drawString(String.format("pos: %.2f", sliderPos), sizeX - 120, 12);
        g2d.drawString("Offset Y: " + verticalOffset, sizeX - 160, 24);
        
        if((lowestComp.location.y + lowestComp.hitBox.height) < sizeY){
            g2d.drawRect(0, lowestComp.location.y + lowestComp.hitBox.height, sizeX, paddingLowestCompPos);
            g2d.setColor(new Color(255,0,255,128));
            g2d.fillRect(1, lowestComp.location.y + lowestComp.hitBox.height + 1, sizeX -2, paddingLowestCompPos - 2);
        }
        
        g2d.drawString("Padding Y :" + paddingLowestCompPos +"px", 0, sizeY);
        g2d.drawString("Lowest component position Y: " + lowestCompPos, 0, 12);
        g2d.drawString("Lowest component Y: " + lowestComp.location.y, 0, 24);
        
    }
    
    
    
}
