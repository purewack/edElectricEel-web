/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import snakeed.Engine;

/**
 *
 * @author damian
 */
public class NumberField extends InputField{
    
    private int lowerBound = 0;
    private int upperBound = 0;
    private boolean useUpperBound = false;
    private boolean useLowerBound = false;
    private int step = 1;
    private Rectangle plusHitBox;
    private Rectangle minusHitBox;
    private Point plusMidpoint;
    private Point minusMidpoint;
    private int buttonWidth = 40;
    
    public NumberField(Point pos) {
        super(pos, InputField.WIDTH_SMALL);
        plusHitBox = new Rectangle(hitBox.x+hitBox.width-buttonWidth,hitBox.y,buttonWidth,hitBox.height/2);
        minusHitBox = new Rectangle(hitBox.x+hitBox.width-buttonWidth,2+hitBox.y+hitBox.height/2,buttonWidth,hitBox.height/2);
        hitBox.width -= buttonWidth;
        plusMidpoint = new Point(plusHitBox.x + plusHitBox.width/2, plusHitBox.y + plusHitBox.height/2);
        minusMidpoint = new Point(minusHitBox.x + minusHitBox.width/2, minusHitBox.y + minusHitBox.height/2);
        text = "0";
    }

    public NumberField(int step, Point pos){
        this(pos);
        this.step = step;
    }
    
    public NumberField( int step, Point pos, int lowerBound, int upperBound){
        this(pos);
        this.step = step;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        useUpperBound = true;
        useLowerBound = true;
        text = Integer.toString(lowerBound);
    }
    
     public NumberField( int step,int lowerBound, int upperBound, String defaultValue){
        this(step, lowerBound, upperBound);
        text = defaultValue;
    }
     
    public NumberField(int step, int lowerBound, Point pos){
        this(pos);
        this.step = step;
        this.lowerBound = lowerBound;
        useLowerBound = true;
        text = Integer.toString(lowerBound);
    }
    
     public NumberField(int step, Point pos, int upperBound){
        this(pos);
        this.step = step;
        this.upperBound = upperBound;
        useUpperBound = true;
        text = "0";
    }
     
    public NumberField(int step){
        this(new Point(0,0));
        this.step = step;
    }
    
    public NumberField( int step, int lowerBound, int upperBound){
        this(new Point(0,0));
        this.step = step;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        useUpperBound = true;
        useLowerBound = true;
        text = Integer.toString(lowerBound);
    }

    
    public void setLowerBound(int lowerBound) {
        this.lowerBound = lowerBound;
    }

    public void setUpperBound(int upperBound) {
        this.upperBound = upperBound;
    }

    public void setStep(int step) {
        this.step = step;
    }
    
    public void useBounds(boolean upper, boolean lower){
        useUpperBound = upper;
        useLowerBound = lower;
    }

    @Override
    public void onMousePress(MouseEvent e) {
        if(plusHitBox.contains(e.getPoint())){
            int i = Integer.parseInt(text);
            i += step;
            if(i > upperBound && useUpperBound){
                i = upperBound;
            }
            text = Integer.toString(i);
        }
        else if(minusHitBox.contains(e.getPoint())){
            int i = Integer.parseInt(text);
            i -= step;
            if(i < lowerBound && useLowerBound){
                i = lowerBound;
            }
            text = Integer.toString(i);
        }
        else{
            super.onMousePress(e);
            if(Integer.parseInt(text) > upperBound && useUpperBound){
                text = Integer.toString(upperBound);
            }
            else if(Integer.parseInt(text) < lowerBound && useLowerBound){
                text = Integer.toString(lowerBound);
            }
        }
        if(text.equals("")){
            text = "0";
        }
        
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        if(Engine.isNumeric(evt) || 
                evt.getKeyCode() == KeyEvent.VK_BACK_SPACE ||
                evt.getKeyCode() == KeyEvent.VK_MINUS){
        super.onKeypress(evt); 
        }
    }

    @Override
    public void setLocation(int x, int y) {
        super.setLocation(x,y);
        plusHitBox.setLocation(hitBox.x+hitBox.width-buttonWidth,hitBox.y);
        minusHitBox.setLocation(hitBox.x+hitBox.width-buttonWidth,2+hitBox.y+hitBox.height/2);
        plusMidpoint.setLocation(plusHitBox.x + plusHitBox.width/2, plusHitBox.y + plusHitBox.height/2);
        minusMidpoint.setLocation(minusHitBox.x + minusHitBox.width/2, minusHitBox.y + minusHitBox.height/2);
    }
      
    public int getValue(){
        return Integer.parseInt(text);
    }

    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles) {
        super.drawComponent(g2d, tiles); 
        
        g2d.setStroke(new BasicStroke(4));
        g2d.setColor(Color.WHITE);
        g2d.fill(plusHitBox);
        g2d.fill(minusHitBox);
        if(super.isTakingInput()){
        g2d.setColor(Color.ORANGE);
        }
        else{
        g2d.setColor(Color.DARK_GRAY);
        }
        g2d.draw(plusHitBox);
        g2d.draw(minusHitBox);
        
        g2d.setStroke(new BasicStroke(2));
        g2d.drawLine(plusMidpoint.x - 3, plusMidpoint.y+1, plusMidpoint.x + 5, plusMidpoint.y+1);// -
        g2d.drawLine(plusMidpoint.x+1, plusMidpoint.y - 3, plusMidpoint.x+1, plusMidpoint.y + 5);// |
        g2d.drawLine(minusMidpoint.x - 3, minusMidpoint.y , minusMidpoint.x + 5, minusMidpoint.y);// -
    }
    
    
}
