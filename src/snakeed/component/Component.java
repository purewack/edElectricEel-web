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
import snakeed.Debuggable;
import snakeed.Engine;
import snakeed.GraphicsPanel;

/**
 *
 * @author damian
 */
public abstract class Component implements Debuggable{
	
	public ActionListener parent;
        public boolean active = true;
        public boolean percent;
	public Point location;
        public Point midPoint;
        public Rectangle hitBox;
	public int percentageX = -1;
	public int percentageY = -1;
        String tag = "";
	
	public Component(Point location, ActionListener l){
            this.location = location;
            parent = l;
	}
	
	public Component(){
            this(new Point(0,0), null);
	}
	
	public Component(ActionListener l){
            this(new Point(0,0), l);
	}
	
	public Component(int x, int y, boolean percent, ActionListener l){
            this(new Point(x,y),l);
	}
        
	public Component(int x, int y, boolean percent){
            if(percent){
            this.percentageX = x;
            this.percentageY = y;
            }
            else{
            location = new Point(x,y);
            }
            this.percent = percent;
            hitBox = new Rectangle();
	}

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
	
        
        
	public void setParent(ActionListener l){
            parent = l;
	}
        
        public Point getLocation(){
            return location;
        }
        
        public void setLocation(int x, int y) {
        hitBox.setLocation(x, y);
        location.setLocation(hitBox.x, hitBox.y);
        midPoint = new Point(hitBox.x + hitBox.width/2, hitBox.y + hitBox.height/2);
        }
        
        public void setLocation(Point loc) {
            setLocation(loc.x, loc.y);
        }
        
        public void setLocationMid(Point midPoint){
            setLocation(midPoint.x - hitBox.width/2, midPoint.y - hitBox.height/2);
        }
        
        public void setLocationMid(int x, int y){
            setLocation(x - hitBox.width/2, y - hitBox.height/2);
        }
        
        public void setLocationPercent(Point percent, int maxWidth, int maxHeight){
            setLocation((maxWidth * percent.x) / 100, (maxHeight * percent.y) / 100);
        }
        
        public void setLocationPercent(int percentX, int percentY, int maxWidth, int maxHeight){
            setLocation((maxWidth * percentX) / 100, (maxHeight * percentY) / 100);
        }
        
        public void setLocationMidPercent(Point percent, int maxWidth, int maxHeight){
            setLocationMid((maxWidth * percent.x) / 100, (maxHeight * percent.y) / 100);
        }
        
        public void setLocationMidPercent(int percentX, int percentY, int maxWidth, int maxHeight){
            setLocationMid((maxWidth * percentX) / 100, (maxHeight * percentY) / 100);
        }
        
        
        public abstract void onKeypress(KeyEvent evt);

        public abstract void onMouseRelease(MouseEvent e);

        public abstract void onMousePress(MouseEvent e);

        public abstract void onMouseMove(MouseEvent e);

        
        public void drawComponent(Graphics2D g2d, BufferedImage tiles){
            if(Engine.debugScene){
                this.paintDebug(g2d);
                String debugString1 = String.format("x:%d, y:%d", location.x, location.y);
                String debugString2 = String.format("width:%d, height:%d", hitBox.width, hitBox.height);
                g2d.setFont(GraphicsPanel.consoleFont.deriveFont(GraphicsPanel.consoleFontSize));
                
                FontMetrics fm = g2d.getFontMetrics();
                int h = fm.getHeight();
                g2d.setColor(Color.BLACK);
                g2d.fillRect(location.x-2, location.y-h*2-2, fm.stringWidth(debugString1)+4, h+4);
                g2d.fillRect(location.x-2, location.y-h-2, fm.stringWidth(debugString2)+4, h+4);
                g2d.setColor(Color.GREEN);
                g2d.drawString(debugString1, location.x, location.y-h);
                g2d.drawString(debugString2, location.x, location.y);
            }
        }
        
}
