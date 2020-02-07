/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.ActionListener;
import java.util.ArrayList;

/**
 *
 * @author damian
 */
public class ComponentGroupRow extends ComponentGroup{
    public enum Placement{
        TOP, MID, BOTTOM;
    }
    
    int tallestComp = 0;
    ArrayList<Placement> compPlacement;
    
    int compPadding = 20;
    Placement placement = Placement.MID;
    
    public ComponentGroupRow() {
        this("", null);
    }

    public ComponentGroupRow(String title) {
        this(title, null);
    }

    public ComponentGroupRow(ActionListener parent) {
        this("", parent);
    }

    public ComponentGroupRow(String title, ActionListener parent) {
        super(title, parent);
        compPlacement = new ArrayList();
        boundBox.setSize(0, 0);
    }
    
    public void addComponent(Component c, Placement p){
        placement = p;
        this.addComponent(c);
    }

    @Override
    public void addComponent(Component c) {
        
        compPlacement.add(placement);
        
        if(c.hitBox.height > tallestComp){
            tallestComp = c.hitBox.height;
        }
        
        if(items.isEmpty()){
            c.setLocation(0,0);
        }
        else{
            Component lastC = items.get(items.size()-1);
            Point p = locInGroup.get(items.size()-1);
            c.setLocation(p.x + lastC.hitBox.width + compPadding, 0);
        }
        
        super.addComponent(c);
    }

    @Override
    protected void refitBounds() {
        boundBox.setSize(0, tallestComp+borderPadding*2);
        Component c;
        Point p;
        Placement plc;
        for(int i = 0; i < items.size(); i++){
            c = items.get(i);
            p = locInGroup.get(i);
            plc = compPlacement.get(i);
            
            int x = p.x + boundBox.x + borderPadding;
            
            switch(plc){
                case TOP:
                    c.setLocation(x, p.y+borderPadding+boundBox.y);
                    break;
                case MID:
                    c.setLocationMid(x+c.hitBox.width/2, boundBox.y+boundBox.height/2);
                    break;
                case BOTTOM:
                    c.setLocation(x, boundBox.y+boundBox.height-c.hitBox.height-borderPadding);
                    break;
            }
            
            locInGroup.remove(i);
            locInGroup.add(i, new Point(c.getLocation().x - boundBox.x - borderPadding, c.getLocation().y - boundBox.y - borderPadding));
            
            if(p.x + c.hitBox.width > boundBox.width - borderPadding*2){
                boundBox.width = p.x + c.hitBox.width + borderPadding*2;
            }
            if(p.y + c.hitBox.height > boundBox.height - borderPadding*2){
                boundBox.height = p.y + c.hitBox.height + borderPadding*2;
            }
        }
    }

    
    
    @Override
    public void paintDebug(Graphics2D g2d) {
        super.paintDebug(g2d);
        g2d.setColor(Color.BLUE);
        for(Component c: items){
            int x = c.location.x + c.hitBox.width + compPadding/2;
            g2d.drawLine(x, boundBox.y+borderPadding+10, x, boundBox.y+boundBox.height-borderPadding-10);
            x -= compPadding/2;
            g2d.drawLine(x, boundBox.y+borderPadding, x, boundBox.y+boundBox.height-borderPadding);
            x += compPadding;
            g2d.drawLine(x, boundBox.y+borderPadding, x, boundBox.y+boundBox.height-borderPadding);
        }
    }
    
    public void setPlacement(Placement placement) {
        this.placement = placement;
    }
    
    
}
