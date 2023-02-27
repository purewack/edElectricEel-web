/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed;

import snakeed.scene.Menu;
import snakeed.scene.Level;
import snakeed.scene.Scene;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontFormatException;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
import javax.swing.JPanel;
import javax.swing.Timer;

/**
 *
 * @author damian
 */
public class GraphicsPanel extends JPanel implements ActionListener{
    private BufferedImage tiles;
    
    private Timer animTimer;
    public boolean consoleMode = false;
    private boolean consoleAnimating = false;
    public int consoleHeight = 0;
    public int consoleTransparency = 170;
    private ArrayList<String> consoleText;
    private char consoleCursor = '_';
    private boolean consoleTyping;
    private int consoleAnimSpeed = 5;
    public static float systemFontSize;
    public static float consoleFontSize;
    public static float buttonFontSize;
    public static float bubbleFontSize;
    public static float groupFontSize;
    public static Font systemFont;
    public static Font buttonFont;
    public static Font consoleFont;
    
    public static Graphics g;
    
    public static int tileSize;
    private int xOffset = 0;
    private int yOffset = 0;
    private Scene sceneToPaint;
    private Scene tempScene;
    private int frameNumber = 0;
    public static int fpsInMs;
    public static int fps;
    
    private boolean transAnimating = false;
    private int transAlpha = 0;
    
    public GraphicsPanel(){
    }
    
    public void setup(int fps){
        this.fps = fps;
        fpsInMs = 1000/this.fps;
        
        animTimer = new Timer(fpsInMs, this);
        animTimer.setActionCommand("ingame");
        try {
            tiles = ImageIO.read(GraphicsPanel.class.getResource("resources/snaes.png"));
            systemFont = Font.createFont(Font.TRUETYPE_FONT, GraphicsPanel.class.getResource("resources/Retro.ttf").openStream());
            buttonFont = Font.createFont(Font.TRUETYPE_FONT, GraphicsPanel.class.getResource("resources/Hak.TTF").openStream());
            consoleFont = Font.createFont(Font.TRUETYPE_FONT, GraphicsPanel.class.getResource("resources/PressStart2P.ttf").openStream());
            GraphicsEnvironment genv = GraphicsEnvironment.getLocalGraphicsEnvironment();
            genv.registerFont(systemFont);
            genv.registerFont(consoleFont);
            
            g = this.getGraphics();
            
        } catch (IOException ex) {
            System.err.println("Could not load image(s)");
            System.err.print(ex);
            System.exit(-1);
        } catch (FontFormatException ex) {
            Logger.getLogger(GraphicsPanel.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        
        consoleFontSize = Float.parseFloat(Options.getGraphic("font_size_console"));
        buttonFontSize = Float.parseFloat(Options.getGraphic("font_size_button"));
        bubbleFontSize = Float.parseFloat(Options.getGraphic("font_size_bubble"));
        systemFontSize = Float.parseFloat(Options.getGraphic("font_size_default"));
        groupFontSize = Float.parseFloat(Options.getGraphic("font_size_group"));
        
        //calculateFontMerics(this.getGraphics());
        animTimer.start();
    }
   

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D)g;
        
        paintScene(g2d);
        if(consoleAnimating || consoleMode){
            paintConsole(g2d);
        }
        if(transAnimating){
            paintTransition(g2d);
        }
    }

    public void setSceneToPaint(Scene s, boolean transition){
        if(sceneToPaint != null){
        sceneToPaint.freeze();
        transAlpha = 0;
        animTimer.setActionCommand("transStart");
        transAnimating = true;
        tempScene = s;
        }
        else{
        sceneToPaint = s;
        }
    }
    
    public void setTileSize(int sizeInPx){
        tileSize = sizeInPx;
    }
    
    private void paintScene(Graphics2D g2d){
        this.setBackground(sceneToPaint.bgColor);
        sceneToPaint.paintScene(g2d, tiles);
    }
    
    private void paintConsole(Graphics g2d){
        
        g2d.setColor(new Color(0,0,0,consoleTransparency)); //semi transparent black
        g2d.fillRect(20, 0, (sceneToPaint.getScreenSize().width - 40), consoleHeight);
        if(consoleHeight >= sceneToPaint.getScreenSize().height - 20){
            g2d.setFont(consoleFont.deriveFont(consoleFontSize));
            g2d.setColor(new Color(255,255,255,consoleTransparency));
            int y = 0;
            ArrayList<String> log = DebugConsole.getLog();
            if(log.size() <= 56){
                for(String s: log){
                g2d.drawString(s, tileSize, tileSize + y);
                y += g2d.getFontMetrics().getHeight();
                }
                g2d.drawString(String.format(">%s%s",DebugConsole.getInputLine(), consoleCursor), tileSize, tileSize + y);
            }
            else{
                g2d.drawString(String.format("---%d more lines---",log.size() - 56), tileSize, tileSize + y);
                y += g2d.getFontMetrics().getHeight();
                for(int i = log.size() - 56; i < log.size(); i++){
                g2d.drawString(log.get(i), tileSize, tileSize + y);
                y += g2d.getFontMetrics().getHeight();
                }
                g2d.drawString(String.format(">%s%s",DebugConsole.getInputLine(), consoleCursor), tileSize, tileSize + y);
            }
        }
    }
    
    private void paintTransition(Graphics2D g2d){
        g2d.setColor(new Color(0,0,0,transAlpha));
        g2d.fillRect(0, 0, sceneToPaint.sizeX, sceneToPaint.sizeY);
    }
    
     
    public boolean toggleConsole(){
        consoleMode = !consoleMode;
        if(consoleMode){
        consoleHeight = 0;
        consoleAnimating = true;
        animTimer.setDelay(consoleAnimSpeed);
        animTimer.setActionCommand("consoleUnfold");
        animTimer.start();
        }
        else{
        consoleAnimating = true;
        animTimer.setDelay(consoleAnimSpeed);
        animTimer.setActionCommand("consoleFold");
        }
        return consoleMode;
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        switch (e.getActionCommand()) {
            case "consoleUnfold":
                if(consoleHeight < (sceneToPaint.getScreenSize().height - 20)){
                    consoleHeight += 15;
                }
                else{
                    animTimer.setActionCommand("consoleTyping");
                    animTimer.setDelay(250);
                }   break;
            case "consoleFold":
                if(consoleHeight > 0){
                    consoleHeight -= 15;
                }
                else{
                    animTimer.setActionCommand("ingame");
                    animTimer.setDelay(fpsInMs);
                    consoleTransparency = 170;
                    sceneToPaint.unfreeze();
                }   break;
            case "consoleTyping":
                if(consoleCursor == '_'){
                    consoleCursor = ' ';
                }
                else{
                    consoleCursor = '_';
                }   break;
            case "transStart":
                if(transAlpha < 255){
                    transAlpha+=32;
                    if(transAlpha > 255){
                        transAlpha = 255;
                    }
                }
                else{
                    sceneToPaint = tempScene;
                    animTimer.setActionCommand("transEnding");
                }
                break;
            case "transEnding":
                if(transAlpha > 0){
                    transAlpha-=32;
                    if(transAlpha < 0){
                        transAlpha = 0;
                    }
                }
                else{
                    transAnimating = false;
                    sceneToPaint.sceneTick.start();
                    animTimer.setActionCommand("ingame");
                }
                break;
            case "ingame":
                
                break;
            default:
                
                break;
        }
        repaint();
    }
    
}
