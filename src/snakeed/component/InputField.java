/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import javax.swing.Timer;
import snakeed.Engine;
import snakeed.GraphicsPanel;

/**
 *
 * @author damian
 */
public class InputField extends Component implements ActionListener{
    
    private Timer cursorTimer;
    public boolean cursor = false;
    public boolean takingInput = false;
    public String text = "";
    private String hintText = "";
    public int height = 18;
    public int textPaddingHeight = 20;
    public int textPaddingWidth = 10;
    
    public static int WIDTH_SMALL = 140;
    public static int WIDTH_MEDIUM = 260;
    public static int WIDTH_LONG = 340;
    

    public InputField(Point pos, int width, ActionListener l){
        location = pos;
        parent = l;
        hitBox = new Rectangle(pos, new Dimension(width+textPaddingWidth,height+textPaddingHeight));
        cursorTimer = new Timer(250,this);
        cursorTimer.setActionCommand("cursor");
    }
    
    public InputField(Point pos, int width){
        this(pos, width, null);
    }
    
    public InputField(Point pos){
        this(pos, WIDTH_MEDIUM, null);
    }
    
    public InputField(){
        this(new Point(0,0), WIDTH_MEDIUM, null);
    }
    
    public InputField(String hintText, Point pos, int width){
        this(pos, width, null);
        this.hintText = hintText;
    }
    
    public InputField( String hintText, Point pos){
        this(pos, WIDTH_MEDIUM, null);
        this.hintText = hintText;
    }

    public boolean isTakingInput() {
        return takingInput;
    }

    public void setTakingInput(boolean takingInput) {
        if(takingInput){
        this.takingInput = true;
        cursorTimer.start();
        }
        else{
        this.takingInput = false;
        cursor = false;
        cursorTimer.stop();
        }
    }

    public String getHintText() {
        return hintText;
    }

    public void setHintText(String hintText) {
        if(hintText.length() > 15){
            hintText = hintText.substring(0,10);
        }
        this.hintText = hintText;
    }
    
    public void addToText(char c){
        text += c;
    }
    
    public void addToText(String s){
        text += s;
    }
    
    public void backSpace(){
        text = text.substring(0, text.length() - 1);
    }
    
    public void clear(){
        text = "";
    }
    
    public boolean contains(Point p){
        return hitBox.contains(p);
    }
    
    @Override
    public void onMouseRelease(MouseEvent e) {
    }

    @Override
    public void onMouseMove(MouseEvent e) {
    }
    
    

    @Override
    public void onMousePress(MouseEvent e) {
        if(contains(e.getPoint())){
            setTakingInput(true);
        }
        else{
            setTakingInput(false);
        }
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        if(takingInput){
            if(evt.getKeyCode() == KeyEvent.VK_BACK_SPACE){
                if(text.length() > 0){
                    backSpace();
                }
            }
            else if(Engine.isAlphaNumeric(evt)){
                addToText(evt.getKeyChar());
            }
        }
    }
    
    

    @Override
    public void actionPerformed(ActionEvent e){
        if(e.getActionCommand().equals("cursor") && super.active){
            cursor = !cursor;
        }
    }
    
    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles){
        g2d.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        FontMetrics fm = g2d.getFontMetrics();
        
        g2d.setStroke(new BasicStroke(4));
        g2d.setColor(Color.WHITE);
        g2d.fill(hitBox);
        
        if(takingInput){
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
        
        if(text.length() > 0 || takingInput){
            String temp = text;
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
            g2d.drawString(hintText, location.x + textPaddingWidth/2, (location.y+height)+textPaddingHeight/2);
        }
        
        super.drawComponent(g2d, tiles);
    }

    @Override
    public void paintDebug(Graphics2D g2d) {
        g2d.setStroke(new BasicStroke(2));
        g2d.setColor(Color.YELLOW);
        g2d.draw(hitBox);
    }
    
    
}
