/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed.component;

import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import snakeed.Debuggable;
import snakeed.Engine;
import snakeed.GraphicsPanel;

/**
 *
 * @author damian
 */
public class ComponentGroup implements Debuggable{
    
    ArrayList<Component> items;
    ArrayList<Point> locInGroup;
    ActionListener compParent;
    public Rectangle boundBox;
    public boolean paintBoundBox;
    public int borderPadding = 10;
    private String groupTitle = "";
    private Color bgColor;
    private Color lineColor;
    private Color titleColor;
    private boolean border = false;
    private boolean displayTitle = false;
    private boolean background = false;

    public ComponentGroup() {
        items = new ArrayList<>();
        locInGroup = new ArrayList<>();
        boundBox = new Rectangle();
        boundBox.setSize(0, 0);
        bgColor = Color.WHITE;
        lineColor = Color.BLACK;
        titleColor = Color.WHITE;
    }
    
    public ComponentGroup(String title){
        this();
        if(title != null){
        groupTitle = title;
        }
        setDisplayTitle(true);
    }
    
    public ComponentGroup(ActionListener parent){
        this();
        compParent = parent;
    } 
    
    public ComponentGroup(String title, ActionListener parent){
        this(title);
        compParent = parent;
    }
    
    public void setPadding(int pad){
        borderPadding = pad;
        if(!items.isEmpty()){
            refitBounds();
        }
        
    }
    
    public Component getLowestComp(){
        int y = 0;
        int index = 0;
        for(int i = 0; i < items.size(); i++){
            if(items.get(i).hitBox.y + items.get(i).hitBox.height> y){
                y = items.get(i).hitBox.y + items.get(i).hitBox.height;
                index = i;
            }
        }
        return items.get(index);
    }
    
    public Point getGroupLocation() {
        return boundBox.getLocation();
    }

    public void setGroupLocation(Point loc) {
        boundBox.setLocation(loc);
        if(!items.isEmpty()){
            int x;
            int y;
            for(int i = 0; i < items.size(); i++){
                x = locInGroup.get(i).x + boundBox.x + borderPadding;
                y = locInGroup.get(i).y + boundBox.y + borderPadding;
                items.get(i).setLocation(x, y);
            }
        }
    }
    
    public void moveGroup(int dx, int dy){
        setGroupLocation(new Point(boundBox.x + dx, boundBox.y + dy));
    }
    
    public void addComponent(Component c){
        c.setParent(compParent);
        
        locInGroup.add(new Point(c.location.x, c.location.y));
        items.add(c);
        refitBounds();
        
    }
    
    protected void refitBounds(){
        boundBox.setSize(0, 0);
        Component c;
        Point p;
        for(int i = 0; i < items.size(); i++){
            c = items.get(i);
            p = locInGroup.get(i);
            int x = p.x + boundBox.x + borderPadding;
            int y = p.y + boundBox.y + borderPadding;
            c.setLocation(x, y);

            if(p.x + c.hitBox.width > boundBox.width - borderPadding*2){
                boundBox.width = p.x + c.hitBox.width + borderPadding*2;
            }
            if(p.y + c.hitBox.height > boundBox.height - borderPadding*2){
                boundBox.height = p.y + c.hitBox.height + borderPadding*2;
            }
        }
    }
    
    
    public void onKeypress(KeyEvent evt){
        for(Component c: items){
        c.onKeypress(evt);
        }
    }

    public void onMouseRelease(MouseEvent e){
        for(Component c: items){
        c.onMouseRelease(e);
        }
    }

    public void onMousePress(MouseEvent e){
        for(Component c: items){
        c.onMousePress(e);
        }
    }

    public void onMouseMove(MouseEvent e){
        for(Component c: items){
        c.onMouseMove(e);
        }
    }
    
    
    public void drawGroup(Graphics2D g2d, BufferedImage tiles){
        if(Engine.debugScene){
            paintDebug(g2d);
        }
        if(background){
            g2d.setColor(bgColor);
            g2d.fill(boundBox);
        }
        if(border){
            g2d.setColor(lineColor);
            g2d.draw(boundBox);
        }
        if(displayTitle){
            g2d.setColor(titleColor);
            g2d.setFont(GraphicsPanel.buttonFont.deriveFont(GraphicsPanel.groupFontSize));
            g2d.drawString(groupTitle, boundBox.x+20, boundBox.y-5);
        }
        for(Component c: items){
            c.drawComponent(g2d, tiles);
        }
    }
    
    @Override
    public void paintDebug(Graphics2D g2d) {
        FontMetrics fm = g2d.getFontMetrics();
        int h = fm.getHeight();
        String debugString1 = String.format("x:%d, y:%d", boundBox.x, boundBox.y);
        String debugString2 = String.format("width:%d, height:%d", boundBox.width, boundBox.height);
        g2d.setFont(GraphicsPanel.consoleFont.deriveFont(GraphicsPanel.consoleFontSize));
        g2d.setColor(Color.DARK_GRAY);
        g2d.fillRect(boundBox.x-2, boundBox.y-h*2-2, fm.stringWidth(debugString1)+4, fm.getHeight()+4);
        g2d.fillRect(boundBox.x-2, boundBox.y-h-2, fm.stringWidth(debugString2)+4, fm.getHeight()+4);
        g2d.setColor(Color.BLUE);
        g2d.drawString(debugString1, boundBox.x, boundBox.y-h);
        g2d.drawString(debugString2, boundBox.x, boundBox.y);
        
        g2d.setColor(new Color(255,0,0,128));
        g2d.fill(boundBox);
        g2d.setColor(new Color(0,255,0,128));
        g2d.draw(boundBox);
        g2d.setColor(new Color(255,0,0,128));
        g2d.drawRect(boundBox.x+borderPadding, boundBox.y+borderPadding, boundBox.width-borderPadding*2, boundBox.height-borderPadding*2);
    }

    public String getGroupTitle() {
        return groupTitle;
    }

    public void setGroupTitle(String groupTitle) {
        this.groupTitle = groupTitle;
    }

    public Color getBgColor() {
        return bgColor;
    }

    public void setBgColor(Color bgColor) {
        this.bgColor = bgColor;
    }

    public Color getLineColor() {
        return lineColor;
    }

    public void setLineColor(Color lineColor) {
        this.lineColor = lineColor;
    }

    public Color getTitleColor() {
        return titleColor;
    }

    public void setTitleColor(Color titleColor) {
        this.titleColor = titleColor;
    }

    public boolean isBorder() {
        return border;
    }

    public void setBorder(boolean border) {
        this.border = border;
    }

    public boolean isDisplayTitle() {
        return displayTitle;
    }

    public void setDisplayTitle(boolean displayTitle) {
        this.displayTitle = displayTitle;
    }

    public boolean isBackground() {
        return background;
    }

    public void setBackground(boolean background) {
        this.background = background;
    }

    public void setCompParent(ActionListener compParent) {
        this.compParent = compParent;
        if(!items.isEmpty()){
            for(Component c: items){
                c.setParent(this.compParent);
            }
        }
    }
    
    
}
