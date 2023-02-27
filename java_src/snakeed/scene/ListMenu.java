/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.scene;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.image.BufferedImage;
import snakeed.component.ComponentGroup;
import snakeed.Tile;

/**
 *
 * @author damian
 */
public class ListMenu extends ScrollMenu{
    
    private int rowPadding = 50;
    
    public ListMenu(Color c, Tile bg) {
        super(c, bg);
    }

    public ListMenu(Color c) {
        super(c);
    }

    @Override
    public void addMovingGroup(ComponentGroup c) {
        int y = 0;
        if(movingGroup.isEmpty()){
            if(c.isDisplayTitle()){
                y += titleHeight;
            }
        }
        else{
            ComponentGroup cg = movingGroup.get(movingGroup.size()-1);
            if(c.isDisplayTitle()){
                y += titleHeight;
            }
            y += cg.boundBox.height + cg.boundBox.y;
        }
        y += rowPadding;
        c.setGroupLocation(new Point(0,y));
        
        super.addMovingGroup(c);
    }
    
    public void addMovingGroup(ComponentGroup c, int x) {
        int y = 0;
        if(movingGroup.isEmpty()){
            if(c.isDisplayTitle()){
                y += titleHeight;
            }
        }
        else{
            ComponentGroup cg = movingGroup.get(movingGroup.size()-1);
            if(c.isDisplayTitle()){
                y += titleHeight;
            }
            y += cg.boundBox.height + cg.boundBox.y;
        }
        y += rowPadding;
        c.setGroupLocation(new Point(x,y));
        
        super.addMovingGroup(c);
    }

    public int getRowPadding() {
        return rowPadding;
    }

    public void setRowPadding(int rowPadding) {
        this.rowPadding = rowPadding;
    }

    
    
}
