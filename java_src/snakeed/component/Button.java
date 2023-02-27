/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;


import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import snakeed.Engine;
import snakeed.GraphicsPanel;

/**
 * 
 * @author damian
 */
public class Button extends Component{
    
    public String text;
    public int buttonWidth;
    public int height = 96;
    public int padding = 64;
    private int currentState = -1;
    private boolean selectionArrows = true;
    private String actionCommand = "";
    
    static final int STATE_UNFOCUSED = -1;
    static final int STATE_FOCUSED = 0;
    static final int STATE_PRESSED = 1;

    public Button(String text,  ActionListener l){
        this(new Point(0,0), text,  l);
    }
    
    public Button(String text,  ActionListener l, String actionCommand){
        this(new Point(0,0), text, l);
        this.actionCommand = actionCommand;
    }
   
    public Button(Point location, String text, ActionListener l, String actionCommand){
        this(location, text, l);
        this.actionCommand = actionCommand;
    }
    
    public Button(String text,  String actionCommand){
        this(new Point(0,0), text, null, actionCommand);
    }
   
    public Button(Point location, String text,  String actionCommand){
        this(location, text,  null, actionCommand);
    }
    
    public Button(Point location, String text){
        this(location, text,  null, "");
    }
    
    public Button( String text){
        this(new Point(0,0), text,  null, "");
    }
    
    public Button(){
        this(new Point(0,0), "",  null, "");
    }
    
    public Button(Point location, String text, ActionListener l){
        this.text = text;
        midPoint = location;
        GraphicsPanel.g.setFont(GraphicsPanel.buttonFont.deriveFont(GraphicsPanel.buttonFontSize));
        FontMetrics fm = GraphicsPanel.g.getFontMetrics();
        buttonWidth = fm.stringWidth(text);
        hitBox = new Rectangle((midPoint.x - buttonWidth/2)-padding/2,midPoint.y - height/2,buttonWidth+padding,height);
        this.location = new Point(hitBox.x, hitBox.y);
        super.setParent(l);
    }

    
    
    public void setFocused(){
        currentState = 0;
    }
    
    public void setUnfocused(){
        currentState = -1;
    }
    
    public void clickButton(){
        currentState = 1;
    }
    
    public void releaseButton(){
        currentState = 0;
        parent.actionPerformed(new ActionEvent(this, Engine.ACTION_ID_BUTTON, actionCommand));
    }

    public int getCurrentState() {
        return currentState;
    }

    public void setCurrentState(int currentState) {
        this.currentState = currentState;
    }
    
    public boolean contains(Point p){
        return hitBox.contains(p);
    }

    public boolean isSelectionArrows() {
        return selectionArrows;
    }

    public void setSelectionArrows(boolean selectionArrows) {
        this.selectionArrows = selectionArrows;
    }
    
    public void setActionCommand(String s){
        actionCommand = s;
    }    

    public String getActionCommand(){
        return actionCommand;
    }

    @Override
    public void onMouseMove(MouseEvent e) {
        if(contains(e.getPoint())){
            setFocused();
        }
        else{
            setUnfocused();
        }
    }

    @Override
    public void onMousePress(MouseEvent e) {
        if(contains(e.getPoint())){
        clickButton();
        }
    }

    @Override
    public void onMouseRelease(MouseEvent e) {
        if(contains(e.getPoint())){
            releaseButton();
        }
        else{
            setUnfocused();
        }
    }

    @Override
    public void onKeypress(KeyEvent evt) {
        
    }
    
    
    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles){
        
        g2d.setFont(GraphicsPanel.buttonFont.deriveFont(GraphicsPanel.buttonFontSize));
        FontMetrics fm = g2d.getFontMetrics();
        
        //button left side
        
        int sx1 = 197;
        int sy1 = 0;
                
        int sx2 = 201;
        int sy2 = 12;
                
        int dx1 = hitBox.x;
        int dy1 = hitBox.y;
                
        int dx2 = dx1 + padding/2;
        int dy2 = dy1 + height;
               
        if(getCurrentState() == Button.STATE_FOCUSED){
        sy1 += 12;
        sy2 += 12;
        }
        else if(getCurrentState() == Button.STATE_PRESSED){
        sy1 += 24;
        sy2 += 24;
        }
        g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
        //button middle
        sx1 = 201;
        sy1 = 0;

        sx2 = 202;
        sy2 = 12;

        dx1 = hitBox.x + padding/2;
        dy1 = hitBox.y;

        dx2 = dx1 + fm.stringWidth(text);
        dy2 = dy1 + height;

        if(getCurrentState() == Button.STATE_FOCUSED){
        sy1 += 12;
        sy2 += 12;
        }
        else if(getCurrentState() == Button.STATE_PRESSED){
        sy1 += 24;
        sy2 += 24;
        }

        g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
        //button right side
        sx1 = 203;
        sy1 = 0;

        sx2 = 207;
        sy2 = 12;

        dx1 = hitBox.x + fm.stringWidth(text) + padding/2;
        dy1 = hitBox.y;

        dx2 = dx1 + padding/2;
        dy2 = dy1 + height;

        if(getCurrentState() == Button.STATE_FOCUSED){
        sy1 += 12;
        sy2 += 12;
        }
        else if(getCurrentState() == Button.STATE_PRESSED){
        sy1 += 24;
        sy2 += 24;
        }
        g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);

        if(selectionArrows){
            //selector arrow left
            if(getCurrentState() != Button.STATE_UNFOCUSED){
            sx1 = 249;
            sy1 = 1;

            sx2 = 254;
            sy2 = 6;

            dx1 = hitBox.x - (padding/2 + 10);
            if(getCurrentState() != Button.STATE_PRESSED){
                dx1 -= 20;
            }
            dy1 = midPoint.y - 20;

            dx2 = dx1 + 40;
            dy2 = dy1 + 40;

            g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);

            sx1 = 249;
            sy1 = 6;

            sx2 = 254;
            sy2 = 11;

            dx1 = hitBox.x + (fm.stringWidth(text)) + (padding+5);
            if(getCurrentState() != Button.STATE_PRESSED){
                dx1 += 20;
            }
            dy1 = midPoint.y - 20;

            dx2 = dx1 + 40;
            dy2 = dy1 + 40;

            g2d.drawImage(tiles, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null);
            }
        }
        
        g2d.setColor(Color.WHITE);
        if(getCurrentState() == Button.STATE_FOCUSED || getCurrentState() == Button.STATE_UNFOCUSED){

            g2d.drawString(text, 
                    hitBox.x + padding/2, 
                    midPoint.y);
        }
        else{
            g2d.drawString(text, 
                    10 + hitBox.x + padding/2, 
                    10 + midPoint.y);
        }
        
        super.drawComponent(g2d, tiles);
    }

    @Override
    public void paintDebug(Graphics2D g2d) {
        g2d.setColor(Color.RED);
            g2d.draw(hitBox);
            g2d.setColor(Color.YELLOW);
            g2d.drawOval(midPoint.x - 5, midPoint.y - 5, 10, 10);
    }
    
    
}
