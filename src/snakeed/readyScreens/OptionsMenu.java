/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.readyScreens;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import snakeed.Options;
import snakeed.Tile;
import snakeed.scene.*;
import snakeed.component.*;

/**
 *
 * @author damian
 */
public class OptionsMenu extends ListMenu{
    
    public OptionsMenu(){
        super(Color.getHSBColor(242, 54, 67));
        Tile pizza = new Tile();
        pizza.setAbsoluteTileCoords(true);
        pizza.setAbsolutePosition(true);
        pizza.setIsAnimated(true);
        pizza.setTileScreenSize(new Dimension(128, 128));
        pizza.setTileSize(new Dimension(8,8));
        pizza.addFrame(new Point(8,16), 0);
        super.setBackground(pizza);
        
        int padding = 30;
        int sceneWidth = Options.getGeneralInt("level_size_width") * Options.getGraphicInt("tile_size_screen");
        
        ComponentGroupFloat audioRow1 = new ComponentGroupFloat("Audio",sceneWidth);
        audioRow1.setTitleColor(Color.DARK_GRAY);
        audioRow1.setPadding(padding);
        audioRow1.addComponent(new Label("Music Volume"), ComponentGroupFloat.Placement.MID);
        audioRow1.addComponent(new NumberField(5, 0, 100, Options.getAudio("music_volume")), ComponentGroupFloat.Placement.RIGHT_MID);
        
        ComponentGroupFloat audioRow2 = new ComponentGroupFloat(sceneWidth);
        audioRow2.setTitleColor(Color.DARK_GRAY);
        audioRow2.setPadding(padding);
        audioRow2.addComponent(new Label("Sound Effects Volume"), ComponentGroupFloat.Placement.MID);
        audioRow2.addComponent(new NumberField(5, 0, 100, Options.getAudio("sfx_volume")), ComponentGroupFloat.Placement.RIGHT_MID);
        
        
        
        
        
        ComponentGroupFloat genRow1 = new ComponentGroupFloat("General Settings",sceneWidth);
        genRow1.setTitleColor(Color.DARK_GRAY);
        genRow1.setPadding(padding);
        genRow1.addComponent(new Label("English Difficulty"), ComponentGroupFloat.Placement.MID);
        genRow1.addComponent(new NumberField(1, 1, 5, Options.getGeneral("english_difficulty")), ComponentGroupFloat.Placement.RIGHT_MID);
        
        ComponentGroupFloat genRow2 = new ComponentGroupFloat(sceneWidth);
        genRow2.setTitleColor(Color.DARK_GRAY);
        genRow2.setPadding(padding);
        genRow2.addComponent(new Label("Maths Difficulty"), ComponentGroupFloat.Placement.MID);
        genRow2.addComponent(new NumberField(1, 1, 5, Options.getGeneral("maths_difficulty")), ComponentGroupFloat.Placement.RIGHT_MID);
        
        
        
        
        
        ComponentGroupFloat keysP1Row1 = new ComponentGroupFloat("Player 1 key bindings",sceneWidth);
        keysP1Row1.setTitleColor(Color.DARK_GRAY);
        keysP1Row1.setPadding(padding);
        keysP1Row1.addComponent(new Label("Up"), ComponentGroupFloat.Placement.MID);
        ComplexTile p1Up = new ComplexTile(){
            @Override
            public void onMouseRelease(MouseEvent e) {
                if(hitBox.contains(e.getPoint())){
                    setTag("rebind");
                }
                else{
                    setTag("");
                }
                super.onMouseRelease(e); //To change body of generated methods, choose Tools | Templates.
            }

            @Override
            public void onKeypress(KeyEvent evt) {
                if(getTag().equals("rebind")){
                    this.setText(String.format("%c", evt.getKeyChar()));
                }
                super.onKeypress(evt); //To change body of generated methods, choose Tools | Templates.
            }
            
        };
        Tile p1UpTile = new Tile();
        p1UpTile.setAbsoluteTileCoords(true);
        p1UpTile.setAbsolutePosition(true);
        p1UpTile.setTileScreenSize(new Dimension(64,64));
        p1UpTile.setTileSize(new Dimension(15,15));
        p1UpTile.addFrame(new Point(208,12), 0);
        p1Up.setBgTile(p1UpTile);
        p1Up.setText("");
        
        keysP1Row1.addComponent(p1Up);
        
        
        
        
        
        
        
        setRowPadding(20);
        setParent(this);
        setSizeInTiles(new Dimension(Options.getGeneralInt("level_size_width"),Options.getGeneralInt("level_size_height")));
        addMovingGroup(audioRow1);
        addMovingGroup(audioRow2);
        addMovingGroup(genRow1);
        addMovingGroup(genRow2);
        addMovingGroup(keysP1Row1);
    }
    
    @Override
            public void actionPerformed(ActionEvent e) {
                
                switch(e.getActionCommand()){
                    case "save":
                        
                        break;
                }
                
                super.actionPerformed(e);
            }
            
}
