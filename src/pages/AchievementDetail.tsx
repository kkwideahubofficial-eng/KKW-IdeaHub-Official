import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Users } from "lucide-react";

const AchievementDetail = () => {
  const { id } = useParams();
  const [achievement, setAchievement] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const res = await api.get(`/achievements/${id}`);
        setAchievement(res.data);
      } catch (e) {
        setAchievement(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievement();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/achievements">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Achievements
        </Button>
      </Link>

      {loading ? (
        <div>Loading...</div>
      ) : !achievement ? (
        <div>Achievement not found.</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{achievement.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(achievement.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {achievement.achievedBy}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {achievement.imageUrl ? (
                <img src={achievement.imageUrl} alt={achievement.title} className="w-full max-h-96 object-cover rounded mb-6" />
              ) : null}
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {achievement.description}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AchievementDetail;


