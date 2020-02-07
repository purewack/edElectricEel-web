/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.Point;
import java.awt.event.ActionListener;
import java.util.ArrayList;

/**
 *
 * @author damian
 */
public class ComponentGroupFloat extends ComponentGroup{
    
    
    int tallestComp = 0;
    ArrayList<Placement> compPlacement;
    
    int sceneWidth = 0;
    int compPadding = 10;
    Placement placement = Placement.MID;

    public ComponentGroupFloat(int sceneWidth) {
         this(null, null, sceneWidth);
    }
    
    public ComponentGroupFloat(String title, int sceneWidth) {
         this(title, null, sceneWidth);
    }

    public ComponentGroupFloat(ActionListener parent, int sceneWidth) {
        this(null, parent, sceneWidth);
    }

    private ComponentGroupFloat(String title, ActionListener parent, int sceneWidth) {
        super(title, parent);
        this.sceneWidth = sceneWidth;
        compPlacement = new ArrayList();
        boundBox.setSize(0, 0);
    }
    
    public enum Placement{
        TOP, MID, BOTTOM,
        RIGHT_TOP, RIGHT_MID, RIGHT_BOTTOM;
    }
    

    public void addComponent(Component c, Placement p){
        placement = p;
        this.addComponent(c);
    }
    
    @Override
    public void addComponent(Component c) {
        
        if(c.hitBox.height > tallestComp){
                tallestComp = c.hitBox.height;
            }
        
        if(placement == Placement.TOP || placement == Placement.MID || placement == Placement.BOTTOM){
            compPlacement.add(placement);
            c.tag = "LEFT";

            if(items.isEmpty()){
                c.setLocation(0,0);
            }
            else{
                int lastLeft = -1;
                for(int i = 0; i < items.size(); i++){
                    if(items.get(i).tag.equals("LEFT")){
                        lastLeft = i;
                    }
                }
                if(lastLeft > -1){
                Component lastC = items.get(lastLeft);
                Point p = locInGroup.get(lastLeft);
                c.setLocation(p.x + lastC.hitBox.width + compPadding, 0);
                }
                else{
                c.setLocation(0,0);
                }
                
            }
        }
        else{
            compPlacement.add(placement);
            c.tag = "RIGHT";

            if(items.isEmpty()){
                c.setLocation(sceneWidth-c.hitBox.width-borderPadding-super.borderPadding,0);
            }
            else{
                int lastRight = -1;
                for(int i = 0; i < items.size(); i++){
                    if(items.get(i).tag.equals("RIGHT")){
                        lastRight = i;
                    }
                }
                
                if(lastRight > -1){
                Component lastC = items.get(lastRight);
                Point p = locInGroup.get(lastRight);
                c.setLocation(p.x - lastC.hitBox.width - compPadding, 0);
                }
                else{
                c.setLocation(sceneWidth-c.hitBox.width-borderPadding-super.borderPadding,0);
                }
            }
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
                case RIGHT_TOP:   
                    c.setLocation(x, p.y+borderPadding+boundBox.y);
                    break;
                case MID:
                case RIGHT_MID:
                    c.setLocationMid(x+c.hitBox.width/2, boundBox.y+boundBox.height/2);
                    break;
                case BOTTOM:
                case RIGHT_BOTTOM:
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
    
}
