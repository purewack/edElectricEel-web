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
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import snakeed.GraphicsPanel;
import snakeed.Tile;

/**
 *
 * @author damian
 */
public class ComplexTile extends Component{
    
    private Tile bgTile;
    private String text;
    private Color textColor = Color.WHITE;
    private Point loc = null;
    private Point txtLocation;
    private int size = GraphicsPanel.tileSize;

    public ComplexTile() {
        super(0, 0, false);
    }
    
    public ComplexTile(Point loc){
        this.loc = loc;
    }
    

    public Tile getBgTile() {
        return bgTile;
    }

    public void setBgTile(Tile bgTile) {
        if(loc != null){
            bgTile.setLocation(loc);
        }
        this.bgTile = bgTile;
    }
    
    
    public void setText(String t){
        text = t;
        GraphicsPanel.g.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        FontMetrics fm = GraphicsPanel.g.getFontMetrics();
        txtLocation = new Point(bgTile.getMidpoint().x - fm.stringWidth(text)/2, bgTile.getMidpoint().y + fm.getHeight()/4);
    }

    @Override
    public void setLocation(Point loc) {
        super.setLocation(loc); //To change body of generated methods, choose Tools | Templates.
        setText(text);
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
        
    }

    @Override
    public void drawComponent(Graphics2D g2d, BufferedImage tiles) {
        super.drawComponent(g2d, tiles);
        bgTile.drawTile(g2d, tiles, 0, 0);
        bgTile.elapseTime();
        g2d.setFont(GraphicsPanel.systemFont.deriveFont(GraphicsPanel.systemFontSize));
        g2d.drawString(text, txtLocation.x, txtLocation.y);
    }
    
}
