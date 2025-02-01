declare module 'play-sound' {
    interface Player {
        play(filepath: string, callback?: (err?: Error) => void): void;
    }
    
    function player(opts?: any): Player;
    export default player;
} 