/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import snakeed.GraphicsPanel;

/**
 *
 * @author damian
 */
public class PasswordField extends InputField{
    
    private char coverChar = '#';
    
    public PasswordField(Point pos, int width, ActionListener l) {
        super(pos, width, l);
    }

    public PasswordField(Point pos, int width) {
        super(pos, width);
    }

    public PasswordField(Point pos) {
        super(pos);
    }

    public PasswordField(String hintText, Point pos, int width) {
        super(hintText, pos, width);
    }

    public PasswordField(String hintText, Point pos) {
        super(hintText, pos);
    }

    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles) {
        g2d.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        FontMetrics fm = g2d.getFontMetrics();
        
        g2d.setStroke(new BasicStroke(4));
        g2d.setColor(Color.WHITE);
        g2d.fill(hitBox);
        
        if(isTakingInput()){
        g2d.setColor(Color.ORANGE);
        }
        else{
        g2d.setColor(Color.DARK_GRAY);
        }
        g2d.setStroke(new BasicStroke(4));
        g2d.drawRect(hitBox.x, 
                hitBox.y, 
                hitBox.width,
                hitBox.height+ 2);
        
        if(text.length() > 0 || isTakingInput()){
            String temp = "";
            for(int i = 0; i < text.length(); i++){
                temp += coverChar;
            }
            if(fm.stringWidth(temp) + fm.charWidth('_') > hitBox.width){
                for(int i = 1; i < temp.length(); i++){
                    if(fm.stringWidth("...") +  fm.stringWidth(temp.substring(i)) + fm.charWidth('_') < hitBox.width){
                        temp = "..." + temp.substring(i);
                        break;
                    }
                }
            }

            g2d.setColor(Color.BLACK);
            if(cursor){
            g2d.drawString(temp + '_', location.x + textPaddingWidth/2, (location.y+height)+textPaddingHeight/2);
            }
            else{
            g2d.drawString(temp, location.x + textPaddingWidth/2, (location.y+height)+textPaddingHeight/2);
            }
        }
        else{
            g2d.setColor(Color.LIGHT_GRAY);
            g2d.drawString("Password", location.x + textPaddingWidth/2, (location.y+height)+textPaddingHeight/2);
        }
    }
    
    
    
}
