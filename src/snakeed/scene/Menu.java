/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.scene;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import snakeed.component.Button;
import snakeed.Engine;
import snakeed.Tile;
import snakeed.component.Component;
import snakeed.component.ComponentGroup;

/**
 *
 * @author damian
 */
public class Menu extends Scene{
    
    public Menu(Color c, Tile bg){
        super(bg,c);
        sceneTick.setActionCommand("menu");
    }
    
    public Menu(Color c){
        super(c);
    }   
    
   
    
    public void addButton(Button b, int percentX,int percentY){
        b.setLocationMidPercent(percentX, percentY, sizeX, sizeY);
        b.setParent(this);
        interactComp.add(b);
    }
    
    @Override
    public void freeze(){
        super.freeze();
        if(background != null){
        background.setIsAnimated(false);
        }
    }

    @Override
    public void unfreeze() {
        super.unfreeze();
        if(background != null){
        background.setIsAnimated(true);
        }
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        super.onKeypress(evt); 
        
        for(Component c: interactComp){
            c.onKeypress(evt);
        }
        
        for(ComponentGroup c: staticGroup){
            c.onKeypress(evt);
        }
    }

    
    @Override
    public boolean onMouseRelease(MouseEvent e) {
        if(!super.onMouseRelease(e)){
            for(Component c: interactComp){
            c.onMouseRelease(e);
            }
            for(ComponentGroup c: staticGroup){
            c.onMouseRelease(e);
            }
        }
        return false;
    }

    @Override
    public boolean onMousePress(MouseEvent e) {
        if(!super.onMousePress(e)){
            for(Component c: interactComp){
            c.onMousePress(e);
            }
            for(ComponentGroup c: staticGroup){
            c.onMousePress(e);
            }
        }
        return false;
    }

    @Override
    public boolean onMouseMove(MouseEvent e) {
        if(!super.onMouseMove(e)){
            for(Component c: interactComp){
            c.onMouseMove(e);
            }
            for(ComponentGroup c: staticGroup){
            c.onMouseMove(e);
            }
        }
        return false;
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        super.actionPerformed(e); 
        switch(e.getActionCommand()){
            case "exit":
                parent.actionPerformed(new ActionEvent(this, Engine.ACTION_ID_SCENE, "exit"));
                break;
            default:
                break;
        }
    }
    
    
}
