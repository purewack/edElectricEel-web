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
import java.awt.Rectangle;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import snakeed.GraphicsPanel;

/**
 *
 * @author damian
 */
public class Label extends Component{
    
    private ArrayList<String> text;
    private String longestLine = "";
    private int paddingX = 10;
    private int paddingY = 10;
    private boolean border = false;
    private boolean background = false;
    private Color textColor;
    private Color bgColor;
    private Color borderColor;
    
    public Label(Point pos, String text) {
        this.text = new ArrayList<>();
        location = pos;
        textColor = Color.BLACK;
        bgColor = Color.WHITE;
        borderColor = Color.LIGHT_GRAY;
        setText(text);
        GraphicsPanel.g.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        FontMetrics fm = GraphicsPanel.g.getFontMetrics();
        hitBox = new Rectangle(location.x+paddingX, location.y+paddingY, 
                    fm.stringWidth(longestLine)+paddingX, fm.getHeight()*this.text.size()+paddingY);
    }
    
    public Label(Point pos){
        this(pos, "");
    }
    
    public Label(String text){
        this(new Point(0,0), text);
    }
    
    public Label(){
        this(new Point(0,0), "");
    }

    
    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
    }

    public int getPaddingX() {
        return paddingX;
    }

    public void setPaddingX(int paddingX) {
        this.paddingX = paddingX;
    }

    public int getPaddingY() {
        return paddingY;
    }

    public void setPaddingY(int paddingY) {
        this.paddingY = paddingY;
    }

    public boolean isBorder() {
        return border;
    }

    public void setBorder(boolean border) {
        this.border = border;
    }

    public boolean isBackground() {
        return background;
    }

    public void setBackground(boolean background) {
        this.background = background;
    }

    public Color getTextColor() {
        return textColor;
    }

    public void setTextColor(Color textColor) {
        this.textColor = textColor;
    }

    public Color getBgColor() {
        return bgColor;
    }

    public void setBgColor(Color bgColor) {
        this.bgColor = bgColor;
    }

    public Color getBorderColor() {
        return borderColor;
    }

    public void setBorderColor(Color borderColor) {
        this.borderColor = borderColor;
    }
    
    
    
    public void setText(String text){
        this.text.clear();
        char[] textChars = text.toCharArray();
        int numberOfNewlines = 0;
        
        for(int i = 0; i < textChars.length; i++){
            if(text.charAt(i) == '\n'){
                numberOfNewlines++;
            }
        }
        
        for(int i = 0; i < numberOfNewlines; i++){
            this.text.add(text.substring(0, text.indexOf("\n")));
            text = text.substring(text.indexOf("\n")+1);
        }
        this.text.add(text);
        
        for(String s: this.text){
            if(s.length() > longestLine.length()){
                longestLine = s;
            }
        }
    }
    
    public String getText(){
        String out = "";
        for(String s: text){
            out += s + '\n';
        }
        return out;
    }
    
    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles){
        g2d.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        FontMetrics fm = g2d.getFontMetrics();
        
        if(background){
            g2d.setColor(bgColor);
            g2d.fillRect(location.x, location.y, 
                    fm.stringWidth(longestLine)+paddingX*2, fm.getHeight()*text.size()+paddingY*2);
        }
        
        if(border){
            g2d.setColor(borderColor);
            g2d.setStroke(new BasicStroke(4));
            g2d.drawRect(location.x-2, location.y-2, 
                    fm.stringWidth(longestLine)+paddingX*2, fm.getHeight()*text.size()+paddingY*2);
        }
        
        int y = location.y+fm.getHeight()+paddingY/2;
        g2d.setColor(textColor);
        for(String s: text){
            g2d.drawString(s, location.x+paddingX/2, y);
            y += fm.getHeight();
        }
        
        super.drawComponent(g2d, tiles);
    }

    @Override
    public void onKeypress(KeyEvent evt) {
    }

    @Override
    public void onMouseRelease(MouseEvent e) {
    }

    @Override
    public void onMousePress(MouseEvent e) {
    }

    @Override
    public void onMouseMove(MouseEvent e) {
    }

    @Override
    public void paintDebug(Graphics2D g2d) {
        FontMetrics fm = g2d.getFontMetrics();
        int y = location.y+fm.getHeight()+paddingY/2;
       
//        
//        g2d.setStroke(new BasicStroke(2));
//        g2d.setColor(Color.YELLOW);
//        g2d.drawRect(location.x-2, 
//                    location.y-2, 
//                    fm.stringWidth(longestLine)+paddingX*2, 
//                    fm.getHeight()*text.size()+paddingY*2);
        g2d.setColor(Color.GREEN);
        y = location.y+fm.getHeight()+(paddingY/2);
        for(int i = 0; i < text.size(); i++){
            g2d.drawLine(location.x+paddingX, 
                    y, 
                    location.x+fm.stringWidth(longestLine),
                    y);
            y += fm.getHeight();
        }
        
        g2d.setStroke(new BasicStroke(2));
        g2d.setColor(Color.WHITE);    
        g2d.draw(hitBox);
    }
    
}
