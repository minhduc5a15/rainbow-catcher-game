"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function GameRules() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🌈 Rainbow Catcher Rules 🌈
          </h1>
          <p className="text-xl text-white/90">
            Learn how to master the rainbow!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Rules */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">🎯 Basic Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">☁️</span>
                  <span>Control the cloud with arrow keys or mouse</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🌈</span>
                  <span>
                    Catch rainbow colors in order: Red → Orange → Yellow → Green
                    → Blue → Indigo → Violet
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💯</span>
                  <span>Each color = 10 points, correct order = +50 bonus</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">❤️</span>
                  <span>You have 3 lives - don't lose them all!</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Special Drops */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-300">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">✨ Special Drops</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span>
                    <strong>Golden Drop:</strong> Speed boost for 5 seconds
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💣</span>
                  <span>
                    <strong>Black Drop:</strong> Lose 1 life & reset combo
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🌈</span>
                  <span>
                    <strong>Rainbow Drop:</strong> Auto-collect all colors for 3
                    seconds
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>Target colors glow and pulse - easier to spot!</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Perfect Rainbow Bonus */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">🏆 Perfect Rainbow</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🌟</span>
                  <span>Complete all 7 colors in perfect order</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span>Earn +100 bonus points</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span>Activate 3-second auto-collect power-up</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🎆</span>
                  <span>Spectacular particle explosion effect</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rain Shower Event */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">🌧️ Rain Shower</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  <span>Occurs every 30 seconds for 5 seconds</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span>Drops fall faster and more frequently</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <span>All points are DOUBLED during rain!</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">🌩️</span>
                  <span>Sky darkens with rain animation</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6 bg-white/90 backdrop-blur-sm border-2 border-yellow-300">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <p className="flex items-center gap-2">
                <span className="text-xl">👀</span>
                <span>Watch for glowing target colors</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span>Focus on the rainbow progress bar</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span>Use speed boosts strategically</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🌧️</span>
                <span>Take advantage of rain shower bonuses</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">💣</span>
                <span>Avoid black bombs at all costs</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>Aim for perfect rainbows for big scores</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-3"
            >
              🎮 Start Playing Now!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
